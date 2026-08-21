import * as CSS from 'csstype';

export type LeanerElement = any[];

export type LeanerNode = LeanerElement | Node | null | string | number | ( () => null | string | number );

export type Component = ( props: any, children: any[] ) => LeanerNode;

export interface App {
  mount( target: HTMLElement ): void;
  destroy(): void;
  provide( key: string | symbol, value: any ): void;
  use( callback: () => void ): void;
}

interface InjectionConstraint<T> {}

export type InjectionKey<T> = symbol & InjectionConstraint<T>;

export declare function createApp( component: Component ): App;

export declare function inject<T>( key: string | InjectionKey<T> ): T | undefined;

export declare function provide<T, K = string | InjectionKey<T>>( key: K, value: K extends InjectionKey<infer V> ? V : T ): void;

export declare function onMount( callback: () => void ): void;

export declare function onDestroy( callback: () => void ): void;

type Prop<T> = T | null | ( () => T | null );

type BooleanProp = Prop<boolean | ''>;

type ReferrerPolicyProp = Prop<'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin'
      | 'strict-origin-when-cross-origin' | 'unsafe-url'>;

type ClassObject = { [ K: string ]: boolean | null | ( () => boolean | null ) };

type ClassProp = string | null | ( () => string | string[] | null ) | Array<string | null | ( () => string | null ) | ClassObject> | ClassObject;

type StyleObject = {
  [ K in keyof CSS.Properties ]: CSS.Properties[ K ] | null | ( () => CSS.Properties[ K ] | null );
};

type StyleProp = string | null | ( () => string | null | CSS.Properties ) | StyleObject;

type GlobalEvent = Event;
type GlobalAnimationEvent = AnimationEvent;
type GlobalClipboardEvent = ClipboardEvent;
type GlobalCompositionEvent = CompositionEvent;
type GlobalDragEvent = DragEvent;
type GlobalFocusEvent = FocusEvent;
type GlobalFormDataEvent = FormDataEvent;
type GlobalInputEvent = InputEvent;
type GlobalKeyboardEvent = KeyboardEvent;
type GlobalMouseEvent = MouseEvent;
type GlobalPointerEvent = PointerEvent;
type GlobalSubmitEvent = SubmitEvent;
type GlobalToggleEvent = ToggleEvent;
type GlobalTouchEvent = TouchEvent;
type GlobalTransitionEvent = TransitionEvent;
type GlobalUIEvent = UIEvent;
type GlobalWheelEvent = WheelEvent;

type BaseTypedEvent<E, C, T> = E & {
  currentTarget: C;
  target: T;
};

type TypedEvent<E, T> = BaseTypedEvent<E, EventTarget & T, EventTarget>;
type TypedTargetEvent<E, T> = BaseTypedEvent<E, EventTarget & T, EventTarget & T>;

type EventHandler<E> = ( e: E ) => void;

export namespace Leaner {
  type Event<T = Element> = TypedEvent<GlobalEvent, T>;
  type AnimationEvent<T = Element> = TypedEvent<GlobalAnimationEvent, T>;
  type ClipboardEvent<T = Element> = TypedEvent<GlobalClipboardEvent, T>;
  type CompositionEvent<T = Element> = TypedEvent<GlobalCompositionEvent, T>;
  type DragEvent<T = Element> = TypedEvent<GlobalDragEvent, T>;
  type FocusEvent<T = Element> = TypedEvent<GlobalFocusEvent, T>;
  type FormDataEvent<T = Element> = TypedEvent<GlobalFormDataEvent, T>;
  type InputEvent<T = Element> = TypedEvent<GlobalInputEvent, T>;
  type KeyboardEvent<T = Element> = TypedEvent<GlobalKeyboardEvent, T>;
  type MouseEvent<T = Element> = TypedEvent<GlobalMouseEvent, T>;
  type PointerEvent<T = Element> = TypedEvent<GlobalPointerEvent, T>;
  type ToggleEvent<T = Element> = TypedEvent<GlobalToggleEvent, T>;
  type TouchEvent<T = Element> = TypedEvent<GlobalTouchEvent, T>;
  type TransitionEvent<T = Element> = TypedEvent<GlobalTransitionEvent, T>;
  type UIEvent<T = Element> = TypedEvent<GlobalUIEvent, T>;
  type WheelEvent<T = Element> = TypedEvent<GlobalWheelEvent, T>;

  type TargetEvent<T = Element> = TypedTargetEvent<GlobalEvent, T>;
  type FocusTargetEvent<T = Element> = TypedTargetEvent<GlobalFocusEvent, T>;

  interface HTMLProps<T = HTMLElement> {
    accesskey?: Prop<string>;
    autocapitalize?: Prop<'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters'>;
    autofocus?: BooleanProp;
    class?: ClassProp;
    contenteditable?: Prop<'true' | 'false' | 'plaintext-only'>;
    dir?: Prop<'ltr' | 'rtl' | 'auto'>;
    draggable?: Prop<'true' | 'false'>;
    enterkeyhint?: Prop<'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'>;
    exportparts?: Prop<string>;
    hidden?: BooleanProp;
    id?: Prop<string>;
    inert?: BooleanProp;
    inputmode?: Prop<'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'>;
    is?: Prop<string>;
    itemid?: Prop<string>;
    itemprop?: Prop<string>;
    itemref?: Prop<string>;
    itemscope?: BooleanProp;
    itemtype?: Prop<string>;
    lang?: Prop<string>;
    nonce?: Prop<string>;
    part?: Prop<string>;
    role?: Prop<'alert' | 'alertdialog' | 'application' | 'article' | 'banner' | 'button' | 'cell' | 'checkbox' | 'columnheader' | 'combobox' | 'complementary' | 'contentinfo'
      | 'definition' | 'dialog' | 'directory' | 'document' | 'feed' | 'figure' | 'form' | 'grid' | 'gridcell' | 'group' | 'heading' | 'img' | 'link' | 'list' | 'listbox'
      | 'listitem' | 'log' | 'main' | 'marquee' | 'math' | 'menu' | 'menubar' | 'menuitem' | 'menuitemcheckbox' | 'menuitemradio' | 'navigation' | 'none' | 'note' | 'option'
      | 'presentation' | 'progressbar' | 'radio' | 'radiogroup' | 'region' | 'row' | 'rowgroup' | 'rowheader' | 'scrollbar' | 'search' | 'searchbox' | 'separator' | 'slider'
      | 'spinbutton' | 'status' | 'switch' | 'tab' | 'table' | 'tablist' | 'tabpanel' | 'term' | 'textbox' | 'timer' | 'toolbar' | 'tooltip' | 'tree' | 'treegrid' | 'treeitem'>;
    slot?: Prop<string>;
    spellcheck?: Prop<'true' | 'false'>;
    style?: StyleProp;
    tabindex?: Prop<number>;
    title?: Prop<string>;
    translate?: Prop<'yes' | 'no'>;

    'aria-activedescendant'?: Prop<string>;
    'aria-atomic'?: Prop<'true' | 'false'>;
    'aria-autocomplete'?: Prop<'none' | 'inline' | 'list' | 'both'>;
    'aria-braillelabel'?: Prop<string>;
    'aria-brailleroledescription'?: Prop<string>;
    'aria-busy'?: Prop<'true' | 'false'>;
    'aria-checked'?: Prop<'true' | 'false' | 'mixed'>;
    'aria-colcount'?: Prop<number>;
    'aria-colindex'?: Prop<number>;
    'aria-colindextext'?: Prop<string>;
    'aria-colspan'?: Prop<number>;
    'aria-controls'?: Prop<string>;
    'aria-current'?: Prop<'true' | 'false' | 'page' | 'step' | 'location' | 'date' | 'time'>;
    'aria-describedby'?: Prop<string>;
    'aria-description'?: Prop<string>;
    'aria-details'?: Prop<string>;
    'aria-disabled'?: Prop<'true' | 'false'>;
    'aria-errormessage'?: Prop<string>;
    'aria-expanded'?: Prop<'true' | 'false'>;
    'aria-flowto'?: Prop<string>;
    'aria-haspopup'?: Prop<'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'>;
    'aria-hidden'?: Prop<'true' | 'false'>;
    'aria-invalid'?: Prop<'true' | 'false' | 'grammar' | 'spelling'>;
    'aria-keyshortcuts'?: Prop<string>;
    'aria-label'?: Prop<string>;
    'aria-labelledby'?: Prop<string>;
    'aria-level'?: Prop<number>;
    'aria-live'?: Prop<'off' | 'assertive' | 'polite'>;
    'aria-modal'?: Prop<'true' | 'false'>;
    'aria-multiline'?: Prop<'true' | 'false'>;
    'aria-multiselectable'?: Prop<'true' | 'false'>;
    'aria-orientation'?: Prop<'horizontal' | 'vertical'>;
    'aria-owns'?: Prop<string>;
    'aria-placeholder'?: Prop<string>;
    'aria-posinset'?: Prop<number>;
    'aria-pressed'?: Prop<'true' | 'false' | 'mixed'>;
    'aria-readonly'?: Prop<'true' | 'false'>;
    'aria-relevant'?: Prop<'additions' | 'additions removals' | 'additions text' | 'all' | 'removals' | 'removals additions' | 'removals text' | 'text' | 'text additions' | 'text removals'>;
    'aria-required'?: Prop<'true' | 'false'>;
    'aria-roledescription'?: Prop<string>;
    'aria-rowcount'?: Prop<number>;
    'aria-rowindex'?: Prop<number>;
    'aria-rowindextext'?: Prop<string>;
    'aria-rowspan'?: Prop<number>;
    'aria-selected'?: Prop<'true' | 'false'>;
    'aria-setsize'?: Prop<number>;
    'aria-sort'?: Prop<'none' | 'ascending' | 'descending' | 'other'>;
    'aria-valuemax'?: Prop<number>;
    'aria-valuemin'?: Prop<number>;
    'aria-valuenow'?: Prop<number>;
    'aria-valuetext'?: Prop<string>;

    textContent?: Prop<string>;
    innerHTML?: Prop<string>;

    ref?: ( value: T | null ) => void;

    onabort?: EventHandler<Event<T>>;
    onanimationend?: EventHandler<AnimationEvent<T>>;
    onanimationiteration?: EventHandler<AnimationEvent<T>>;
    onanimationstart?: EventHandler<AnimationEvent<T>>;
    onauxclick?: EventHandler<MouseEvent<T>>;
    onbeforeinput?: EventHandler<InputEvent<T>>;
    onblur?: EventHandler<FocusTargetEvent<T>>;
    oncancel?: EventHandler<Event<T>>;
    oncanplay?: EventHandler<Event<T>>;
    oncanplaythrough?: EventHandler<Event<T>>;
    onchange?: EventHandler<Event<T>>;
    onclick?: EventHandler<PointerEvent<T>>;
    onclose?: EventHandler<Event<T>>;
    oncompositionend?: EventHandler<CompositionEvent<T>>;
    oncompositionstart?: EventHandler<CompositionEvent<T>>;
    oncompositionupdate?: EventHandler<CompositionEvent<T>>;
    oncontextmenu?: EventHandler<PointerEvent<T>>;
    oncopy?: EventHandler<ClipboardEvent<T>>;
    oncut?: EventHandler<ClipboardEvent<T>>;
    ondblclick?: EventHandler<PointerEvent<T>>;
    ondrag?: EventHandler<DragEvent<T>>;
    ondragend?: EventHandler<DragEvent<T>>;
    ondragenter?: EventHandler<DragEvent<T>>;
    ondragleave?: EventHandler<DragEvent<T>>;
    ondragover?: EventHandler<DragEvent<T>>;
    ondragstart?: EventHandler<DragEvent<T>>;
    ondrop?: EventHandler<DragEvent<T>>;
    ondurationchange?: EventHandler<Event<T>>;
    onemptied?: EventHandler<Event<T>>;
    onencrypted?: EventHandler<Event<T>>;
    onended?: EventHandler<Event<T>>;
    onerror?: EventHandler<UIEvent<T>>;
    onfocus?: EventHandler<FocusTargetEvent<T>>;
    onfocusin?: EventHandler<FocusEvent<T>>;
    onfocusout?: EventHandler<FocusEvent<T>>;
    onformdata?: EventHandler<FormDataEvent<T>>;
    ongotpointercapture?: EventHandler<PointerEvent<T>>;
    oninput?: EventHandler<InputEvent<T>>;
    oninvalid?: EventHandler<Event<T>>;
    onkeydown?: EventHandler<KeyboardEvent<T>>;
    onkeyup?: EventHandler<KeyboardEvent<T>>;
    onload?: EventHandler<UIEvent<T>>;
    onloadeddata?: EventHandler<UIEvent<T>>;
    onloadedmetadata?: EventHandler<UIEvent<T>>;
    onloadstart?: EventHandler<UIEvent<T>>;
    onlostpointercapture?: EventHandler<PointerEvent<T>>;
    onmousedown?: EventHandler<MouseEvent<T>>;
    onmouseenter?: EventHandler<MouseEvent<T>>;
    onmouseleave?: EventHandler<MouseEvent<T>>;
    onmousemove?: EventHandler<MouseEvent<T>>;
    onmouseout?: EventHandler<MouseEvent<T>>;
    onmouseover?: EventHandler<MouseEvent<T>>;
    onmouseup?: EventHandler<MouseEvent<T>>;
    onpaste?: EventHandler<ClipboardEvent<T>>;
    onpause?: EventHandler<Event<T>>;
    onplay?: EventHandler<Event<T>>;
    onplaying?: EventHandler<Event<T>>;
    onpointercancel?: EventHandler<PointerEvent<T>>;
    onpointerdown?: EventHandler<PointerEvent<T>>;
    onpointerenter?: EventHandler<PointerEvent<T>>;
    onpointerleave?: EventHandler<PointerEvent<T>>;
    onpointermove?: EventHandler<PointerEvent<T>>;
    onpointerout?: EventHandler<PointerEvent<T>>;
    onpointerover?: EventHandler<PointerEvent<T>>;
    onpointerup?: EventHandler<PointerEvent<T>>;
    onprogress?: EventHandler<Event<T>>;
    onratechange?: EventHandler<Event<T>>;
    onreset?: EventHandler<Event<T>>;
    onresize?: EventHandler<Event<T>>;
    onseeked?: EventHandler<Event<T>>;
    onseeking?: EventHandler<Event<T>>;
    onscroll?: EventHandler<Event<T>>;
    onscrollend?: EventHandler<Event<T>>;
    onselect?: EventHandler<Event<T>>;
    onselectionchange?: EventHandler<Event<T>>;
    onstalled?: EventHandler<Event<T>>;
    onsubmit?: EventHandler<SubmitEvent<T>>;
    onsuspend?: EventHandler<Event<T>>;
    ontimeupdate?: EventHandler<Event<T>>;
    ontoggle?: EventHandler<ToggleEvent<T>>;
    ontouchcancel?: EventHandler<TouchEvent<T>>;
    ontouchend?: EventHandler<TouchEvent<T>>;
    ontouchmove?: EventHandler<TouchEvent<T>>;
    ontouchstart?: EventHandler<TouchEvent<T>>;
    ontransitioncancel?: EventHandler<TransitionEvent<T>>;
    ontransitionend?: EventHandler<TransitionEvent<T>>;
    ontransitionrun?: EventHandler<TransitionEvent<T>>;
    ontransitionstart?: EventHandler<TransitionEvent<T>>;
    onvolumechange?: EventHandler<Event<T>>;
    onwaiting?: EventHandler<Event<T>>;
    onwaitingforkey?: EventHandler<Event<T>>;
    onwheel?: EventHandler<WheelEvent<T>>;
  }

  interface HTMLAnchorProps extends HTMLProps<HTMLAnchorElement> {
    download?: Prop<string>;
    href?: Prop<string>;
    hreflang?: Prop<string>;
    media?: Prop<string>;
    ping?: Prop<string>;
    referrerpolicy?: ReferrerPolicyProp;
    rel?: Prop<string>;
    target?: Prop<string>;
    type?: Prop<string>;
  }

  interface HTMLAreaProps extends HTMLProps<HTMLAreaElement> {
    alt?: Prop<string>;
    coords?: Prop<string>;
    download?: Prop<string>;
    href?: Prop<string>;
    ping?: Prop<string>;
    referrerpolicy?: ReferrerPolicyProp;
    rel?: Prop<string>;
    shape?: Prop<string>;
    target?: Prop<string>;
  }

  interface HTMLAudioProps extends HTMLProps<HTMLAudioElement> {
    autoplay?: BooleanProp;
    controls?: BooleanProp;
    controlslist?: Prop<string>;
    crossorigin?: Prop<'anonymous' | 'use-credentials'>;
    loading?: Prop<'eager' | 'lazy'>;
    loop?: BooleanProp;
    muted?: BooleanProp;
    preload?: Prop<'none' | 'metadata' | 'auto'>;
    src?: Prop<string>;
  }

  interface HTMLBaseProps extends HTMLProps<HTMLBaseElement> {
    href?: Prop<string>;
    target?: Prop<string>;
  }

  interface HTMLButtonProps extends HTMLProps<HTMLButtonElement> {
    autofocus?: BooleanProp;
    disabled?: BooleanProp;
    form?: Prop<string>;
    formaction?: Prop<string>;
    formenctype?: Prop<string>;
    formmethod?: Prop<string>;
    formnovalidate?: BooleanProp;
    formtarget?: Prop<string>;
    name?: Prop<string>;
    type?: Prop<'submit' | 'reset' | 'button'>;
    value?: Prop<string>;
  }

  interface HTMLCanvasProps extends HTMLProps<HTMLCanvasElement> {
    height?: Prop<number>;
    width?: Prop<number>;
  }

  interface HTMLDataProps extends HTMLProps<HTMLDataElement> {
    value?: Prop<string>;
  }

  interface HTMLDetailsProps extends HTMLProps<HTMLDetailsElement> {
    name?: Prop<string>;
    open?: BooleanProp;
  }

  interface HTMLDialogProps extends HTMLProps<HTMLDialogElement> {
    closedby?: Prop<'any' | 'closerequest' | 'none'>;
    open?: BooleanProp;
  }

  interface HTMLEmbedProps extends HTMLProps<HTMLEmbedElement> {
    height?: Prop<number>;
    src?: Prop<string>;
    type?: Prop<string>;
    width?: Prop<number>;
  }

  interface HTMLFieldSetProps extends HTMLProps<HTMLFieldSetElement> {
    disabled?: BooleanProp;
    form?: Prop<string>;
    name?: Prop<string>;
  }

  interface HTMLFormProps extends HTMLProps<HTMLFormElement> {
    'accept-charset'?: Prop<string>;
    action?: Prop<string>;
    autocomplete?: Prop<'on' | 'off'>;
    enctype?: Prop<string>;
    method?: Prop<string>;
    name?: Prop<string>;
    novalidate?: BooleanProp;
    rel?: Prop<string>;
    target?: Prop<string>;
  }

  interface HTMLIFrameProps extends HTMLProps<HTMLIFrameElement> {
    allow?: Prop<string>;
    allowfullscreen?: BooleanProp;
    height?: Prop<number>;
    loading?: Prop<'eager' | 'lazy'>;
    name?: Prop<string>;
    referrerpolicy?: ReferrerPolicyProp;
    sandbox?: Prop<string>;
    src?: Prop<string>;
    srcdoc?: Prop<string>;
    width?: Prop<number>;
  }

  interface HTMLImageProps extends HTMLProps<HTMLImageElement> {
    alt?: Prop<string>;
    crossorigin?: Prop<'anonymous' | 'use-credentials'>;
    decoding?: Prop<'sync' | 'async' | 'auto'>;
    fetchpriority?: Prop<'high' | 'low' | 'auto'>;
    height?: Prop<number>;
    ismap?: BooleanProp;
    loading?: Prop<'eager' | 'lazy'>;
    referrerpolicy?: ReferrerPolicyProp;
    sizes?: Prop<string>;
    src?: Prop<string>;
    srcset?: Prop<string>;
    usemap?: Prop<string>;
    width?: Prop<number>;
  }

  interface HTMLInputProps extends HTMLProps<HTMLInputElement> {
    accept?: Prop<string>;
    alt?: Prop<string>;
    autocomplete?: Prop<'on' | 'off'>;
    autofocus?: BooleanProp;
    checked?: Prop<boolean>;
    dirname?: Prop<string>;
    disabled?: BooleanProp;
    form?: Prop<string>;
    formaction?: Prop<string>;
    formenctype?: Prop<string>;
    formmethod?: Prop<string>;
    formnovalidate?: BooleanProp;
    formtarget?: Prop<string>;
    height?: Prop<number>;
    inputmode?: Prop<'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'>;
    list?: Prop<string>;
    max?: Prop<number | string>;
    maxlength?: Prop<number>;
    min?: Prop<number | string>;
    minlength?: Prop<number>;
    multiple?: BooleanProp;
    name?: Prop<string>;
    pattern?: Prop<string>;
    placeholder?: Prop<string>;
    readonly?: BooleanProp;
    required?: BooleanProp;
    size?: Prop<number>;
    src?: Prop<string>;
    step?: Prop<number | 'any'>;
    type?: Prop<'button' | 'checkbox' | 'color' | 'date' | 'datetime-local' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | 'range'
      | 'reset' | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week'>;
    value?: Prop<string>;
    width?: Prop<number>;

    onchange?: EventHandler<TargetEvent<HTMLInputElement>>;
  }

  interface HTMLLabelProps extends HTMLProps<HTMLLabelElement> {
    for?: Prop<string>;
  }

  interface HTMLLIProps extends HTMLProps<HTMLLIElement> {
    value?: Prop<number>;
  }

  interface HTMLLinkProps extends HTMLProps<HTMLLinkElement> {
    as?: Prop<string>;
    blocking?: Prop<'render'>;
    crossorigin?: Prop<'anonymous' | 'use-credentials'>;
    disabled?: BooleanProp;
    fetchpriority?: Prop<'high' | 'low' | 'auto'>;
    href?: Prop<string>;
    hreflang?: Prop<string>;
    imagesizes?: Prop<string>;
    imagesrcset?: Prop<string>;
    integrity?: Prop<string>;
    media?: Prop<string>;
    referrerpolicy?: ReferrerPolicyProp;
    rel?: Prop<string>;
    sizes?: Prop<string>;
    type?: Prop<string>;
  }

  interface HTMLMapProps extends HTMLProps<HTMLMapElement> {
    name?: Prop<string>;
  }

  interface HTMLMetaProps extends HTMLProps<HTMLMetaElement> {
    charset?: Prop<string>;
    content?: Prop<string>;
    'http-equiv'?: Prop<string>;
    media?: Prop<string>;
    name?: Prop<string>;
  }

  interface HTMLMeterProps extends HTMLProps<HTMLMeterElement> {
    high?: Prop<number>;
    low?: Prop<number>;
    max?: Prop<number>;
    min?: Prop<number>;
    optimium?: Prop<number>;
    value?: Prop<number>;
  }

  interface HTMLModProps extends HTMLProps<HTMLModElement> {
    cite?: Prop<string>;
    datetime?: Prop<string>;
  }

  interface HTMLObjectProps extends HTMLProps<HTMLObjectElement> {
    data?: Prop<string>;
    form?: Prop<string>;
    height?: Prop<number>;
    name?: Prop<string>;
    type?: Prop<string>;
    width?: Prop<number>;
  }

  interface HTMLLOListProps extends HTMLProps<HTMLOListElement> {
    reversed?: BooleanProp;
    start?: Prop<number>;
    type?: Prop<string>;
  }

  interface HTMLOptGroupProps extends HTMLProps<HTMLOptGroupElement> {
    disabled?: BooleanProp;
    label?: Prop<string>;
  }

  interface HTMLOptionProps extends HTMLProps<HTMLOptionElement> {
    disabled?: BooleanProp;
    label?: Prop<string>;
    selected?: BooleanProp;
    value?: Prop<string>;
  }

  interface HTMLOutputProps extends HTMLProps<HTMLOutputElement> {
    for?: Prop<string>;
    form?: Prop<string>;
    name?: Prop<string>;
  }

  interface HTMLProgressProps extends HTMLProps<HTMLProgressElement> {
    max?: Prop<number>;
    value?: Prop<number>;
  }

  interface HTMLQuoteProps extends HTMLProps<HTMLQuoteElement> {
    cite?: Prop<string>;
  }

  interface HTMLScriptProps extends HTMLProps<HTMLScriptElement> {
    async?: BooleanProp;
    blocking?: Prop<'render'>;
    crossorigin?: Prop<'anonymous' | 'use-credentials'>;
    defer?: BooleanProp;
    fetchpriority?: Prop<'high' | 'low' | 'auto'>;
    integrity?: Prop<string>;
    nomodule?: BooleanProp;
    referrerpolicy?: ReferrerPolicyProp;
    src?: Prop<string>;
    type?: Prop<string>;
  }

  interface HTMLSelectProps extends HTMLProps<HTMLSelectElement> {
    autocomplete?: Prop<'on' | 'off'>;
    autofocus?: BooleanProp;
    disabled?: BooleanProp;
    form?: Prop<string>;
    multiple?: BooleanProp;
    name?: Prop<string>;
    required?: BooleanProp;
    size?: Prop<number>;
    value?: Prop<string>;

    onchange?: EventHandler<TargetEvent<HTMLSelectElement>>;
  }

  interface HTMLSlotProps extends HTMLProps<HTMLSlotElement> {
    name?: Prop<string>;
  }

  interface HTMLSourceProps extends HTMLProps<HTMLSourceElement> {
    height?: Prop<number>;
    media?: Prop<string>;
    sizes?: Prop<string>;
    src?: Prop<string>;
    srcset?: Prop<string>;
    type?: Prop<string>;
    width?: Prop<number>;
  }

  interface HTMLStyleProps extends HTMLProps<HTMLStyleElement> {
    blocking?: Prop<'render'>;
    media?: Prop<string>;
  }

  interface HTMLTableColProps extends HTMLProps<HTMLTableColElement> {
    span?: Prop<number>;
  }

  interface HTMLTableCellProps extends HTMLProps<HTMLTableCellElement> {
    colspan?: Prop<number>;
    headers?: Prop<string>;
    rowspan?: Prop<number>;
  }

  interface HTMLTableCellHeaderProps extends HTMLProps<HTMLTableCellElement> {
    abbr?: Prop<string>;
    colspan?: Prop<number>;
    headers?: Prop<string>;
    rowspan?: Prop<number>;
    scope?: Prop<'row' | 'col' | 'rowgroup' | 'colgroup'>;
  }

  interface HTMLTextAreaProps extends HTMLProps<HTMLTextAreaElement> {
    autocomplete?: Prop<'on' | 'off'>;
    autofocus?: BooleanProp;
    cols?: Prop<number>;
    dirname?: Prop<string>;
    disabled?: BooleanProp;
    form?: Prop<string>;
    maxlength?: Prop<number>;
    minlength?: Prop<number>;
    name?: Prop<string>;
    placeholder?: Prop<string>;
    readonly?: BooleanProp;
    required?: BooleanProp;
    rows?: Prop<number>;
    wrap?: Prop<'hard' | 'soft'>;
    value?: Prop<string>;

    onchange?: EventHandler<TargetEvent<HTMLTextAreaElement>>;
  }

  interface HTMLTimeProps extends HTMLProps<HTMLTimeElement> {
    datetime?: Prop<string>;
  }

  interface HTMLTrackProps extends HTMLProps<HTMLTrackElement> {
    default?: BooleanProp;
    kind?: Prop<string>;
    label?: Prop<string>;
    src?: Prop<string>;
    srclang?: Prop<string>;
  }

  interface HTMLVideoProps extends HTMLProps<HTMLVideoElement> {
    autoplay?: BooleanProp;
    controls?: BooleanProp;
    controlslist?: Prop<string>;
    crossorigin?: Prop<'anonymous' | 'use-credentials'>;
    height?: Prop<number>;
    loading?: Prop<'eager' | 'lazy'>;
    loop?: BooleanProp;
    muted?: BooleanProp;
    playsinline?: BooleanProp;
    poster?: Prop<string>;
    preload?: Prop<'none' | 'metadata' | 'auto'>;
    src?: Prop<string>;
    width?: Prop<number>;
  }
}
