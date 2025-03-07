type DeepReadonly<T> = T extends object ? {
  readonly [ K in keyof T ]: DeepReadonly<T[ K ]>;
} : T;

type PropGetter<T> = {
  readonly [ K in keyof T ]: Getter<T[ K ]>;
};

type ObjectGetter<T> = PropGetter<T> & {
  get( prop: string | ( () => string ) ): Getter<any>;
};

type ArrayGetter<T> = {
  readonly [ index: number ]: Getter<T>;
  get( index: number | ( () => number ) ): Getter<T>;
  length(): number;
}

declare class Mutator<T> {
  private callback: ( value: T ) => void;
}

type Getter<T> = ( () => DeepReadonly<T> ) & ( T extends Array<infer U> ? ArrayGetter<U> : T extends object ? ObjectGetter<T> : {} );

type Setter<T> = ( value: ( T extends Function ? never : T ) | ( ( value: DeepReadonly<T> ) => T ) | Mutator<T> ) => void;

export declare function state<T>( initial: T ): [ Getter<T>, Setter<T> ];

export declare function watch<T>( getter: () => T, callback: ( value: T, oldValue: T ) => void ): void;

export declare function effect( callback: () => void ): void;

export declare function reactive<T>( getter: () => T, callback: ( value: T, oldValue: T | undefined ) => void ): void;

export declare function computed<T>( callback: () => T ): Getter<T>;

export declare function constant<T>( value: T ): Getter<T>;

export declare function transform<T, U>( value: T | ( () => T ), callback: ( value: T ) => U ): U | ( () => U );

export declare function get<T>( value: T | ( () => T ) ): T;

export declare function getter<T>( value: T | ( () => T ) ): () => T;

export declare function mutate<T>( callback: ( value: T ) => void ): Mutator<T>;

export declare function schedule( callback: () => void ): void;

export declare function withScope<T>( scope: any[], callback: () => T ): T;

export declare function destroyScope( scope: any[] ): void;
