interface CodeTransform {
  code: any;
  map?: any;
}

interface Plugin {
  name: string;
  transform( code: string, id: string, meta?: object ): CodeTransform | undefined;
}

export default function leanerJsx(): Plugin;
