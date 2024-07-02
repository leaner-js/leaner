import { readFile } from 'fs/promises';
import http from 'http';
import { resolve } from 'path';
import { parse } from 'path/posix';
import url from 'url';

const MimeTypes = {
  '.css': 'text/css',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

export async function createServer( rootDir, port ) {
  const connections = new Set();
  const clients = new Set();

  let closing = false;

  const clientScript = await readFile( new URL( 'client.js', import.meta.url ) );

  const server = http.createServer( handleRequest );

  server.on( 'connection', conn => {
    connections.add( conn );
    conn.on( 'close', () => connections.delete( conn ) );
  } );

  async function handleRequest( req, res ) {
    try {
      const parsedUrl = url.parse( req.url );

      if ( parsedUrl.pathname == '/__sync__' )
        return handleSync( req, res );

      if ( parsedUrl.pathname == '/__sync__/client.js' ) {
        res.setHeader( 'Content-Type', MimeTypes[ '.js' ] );
        res.end( clientScript );
        return;
      }

      let pathname = `.${ parsedUrl.pathname }`;

      if ( pathname.endsWith( '/' ) )
        pathname += 'index.html';

      const fullPath = resolve( rootDir, pathname );
      const ext = parse( pathname ).ext;

      let content = await readFile( fullPath, 'utf-8' );

      res.setHeader( 'Content-Type', MimeTypes[ ext ] || 'application/octet-stream' );

      if ( ext == '.html' ) {
        res.setHeader( 'Cache-Control', 'no-store' );
        content = content.replace( '</body>', '<script src="/__sync__/client.js" type="module"></script>\n</body>' );
      }

      res.end( content );
    } catch ( err ) {
      if ( err.code == 'ENOENT' ) {
        res.statusCode = 404;
      } else {
        console.error( err );
        res.statusCode = 500;
      }
      res.end();
    }
  }

  async function handleSync( req, res ) {
    res.writeHead( 200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
      'Connection': 'keep-alive',
    } );

    res.write( 'retry: 10000\n' );

    clients.add( res );

    req.on( 'close', () => {
      clients.delete( res );
      if ( closing && clients.size == 0 ) {
        for ( const conn of connections )
          conn.destroy();
      }
    } );
  }

  const result = {
    reload() {
      for ( const client of clients )
        client.write( 'event: reload\ndata: {}\n\n' );
    },

    close() {
      closing = true;
      server.close();
      if ( clients.size > 0 ) {
        for ( const client of clients )
          client.end();
      } else {
        for ( const conn of connections )
          conn.destroy();
      }
    },
  };

  return new Promise( ( resolve, reject ) => {
    server.listen( port, () => resolve( result ) );
  } );
}
