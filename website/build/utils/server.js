import { readFile } from 'fs/promises';
import { createServer } from 'http';
import { extname, resolve } from 'path';

import { lookup } from 'mrmime';

export async function createDevServer( rootDir, port ) {
  const connections = new Set();
  const clients = new Set();

  let closing = false;

  const baseUrl = `http://localhost:${port}/`;

  const clientScript = await readFile( new URL( 'client.js', import.meta.url ) );

  const server = createServer( handleRequest );

  server.on( 'connection', conn => {
    connections.add( conn );
    conn.on( 'close', () => connections.delete( conn ) );
  } );

  async function handleRequest( req, res ) {
    try {
      const url = new URL( req.url, baseUrl );

      if ( url.pathname == '/__sync__' )
        return handleSync( req, res );

      if ( url.pathname == '/__sync__/client.js' ) {
        res.setHeader( 'Content-Type', 'text/javascript' );
        res.end( clientScript );
        return;
      }

      let pathname = `.${ url.pathname }`;

      if ( pathname.endsWith( '/' ) )
        pathname += 'index.html';

      const fullPath = resolve( rootDir, pathname );
      const ext = extname( pathname );

      let content = await readFile( fullPath );

      res.setHeader( 'Content-Type', lookup( ext ) || 'application/octet-stream' );

      if ( ext == '.html' ) {
        res.setHeader( 'Cache-Control', 'no-store' );
        content = Buffer.from( content.toString( 'utf-8' ).replace( '</body>', '<script src="/__sync__/client.js" type="module"></script>\n</body>' ), 'utf-8' );
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
    get baseUrl() {
      return baseUrl;
    },

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
