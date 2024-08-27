interface App {
  mount( target: HTMLElement ): void;
  destroy(): void;
  provide( key: string | symbol, value: any ): void;
  use( callback: () => void ): void;
}

export declare function createApp( component: ( props: object, children: any[] ) => any ): App;

export declare function inject( key: string | symbol ): any;

export declare function provide( key: string | symbol, value: any ): void;

export declare function onMount( callback: () => void ): void;

export declare function onDestroy( callback: () => void ): void;
