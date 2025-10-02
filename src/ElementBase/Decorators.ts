import type { ElementBase, TElementBaseChildRefDecoratorFactory, TElementBaseCustomElementDecoratorFactory } from "./Component";

/**
 * Field accessor decorator to initialize a field to the element returned by querying the given selector 
 * on the {@link ElementBase}'s shadow root, or the {@link ElementBase} itself, by invoking 
 * {@link ElementBase.createChildRef}.
 * @param selector The selector to query.
 */
export function childRef<T extends Element>(selector: string): TElementBaseChildRefDecoratorFactory<T>;

/**
 * Default field accessor decorator to initialize a field to the element returned by querying the selector formed from
 * appending the field's name to a '#' string (effectively using the field's name to form an ID selector) on the
 * {@link ElementBase}'s shadow root, or the {@link ElementBase} itself, by invoking {@link ElementBase.createChildRef}.
 */
export function childRef<T extends Element>(value: ClassAccessorDecoratorTarget<ElementBase, T>, context: ClassAccessorDecoratorContext<ElementBase, T>): ClassAccessorDecoratorResult<ElementBase, T>;
export function childRef<T extends Element>(selector_or_val: string | ClassAccessorDecoratorTarget<ElementBase, T>, context?: ClassAccessorDecoratorContext<ElementBase, T>) {
    if(typeof selector_or_val === 'string') {
        return ((value: ClassAccessorDecoratorTarget<ElementBase, T>, context: ClassAccessorDecoratorContext<ElementBase, T>): ClassAccessorDecoratorResult<ElementBase, T> => {
            return {
                set(_value) {}, // makes this readonly
                init(this: ElementBase, _value) {
                    return this.createChildRef<T>('strong', selector_or_val);
                },
            }
        }) as TElementBaseChildRefDecoratorFactory<T>
    }

    return { 
        set(_value) {}, // makes this readonly
        init(this: ElementBase, _value) {
            return this.createChildRef<T>('strong', `#${String(context.name)}`);
        },
    } as ClassAccessorDecoratorResult<ElementBase, T>;
}

/**
 * Class decorator to register the class as a custom HTML element in a static initializer.
 * @param tag_name The tag name to use for this custom HTML element.
 */
export function customElement<T extends typeof ElementBase>(tag_name: string): TElementBaseCustomElementDecoratorFactory<T>;

/**
 * Default class decorator to register the class as a custom HTML element in a static initializer.
 * Generates the tag name automatically by separating capital-case substrings and concatenating them with dashes.
 */
export function customElement<T extends typeof ElementBase>(cls: T, context: ClassDecoratorContext<T>): void;
export function customElement<T extends typeof ElementBase>(cls_or_tag: string | T, context_arg?: ClassDecoratorContext<T>) {
    if(typeof cls_or_tag === 'string') {
        return (cls: T, context: ClassDecoratorContext<T>) => {
            if(!context || context.kind !== 'class') throw new Error(`Invalid class decorator for "${context.name}"!`)
            context.addInitializer(registerElement.bind(globalThis, cls, cls_or_tag))
        }
    }
    if(!context_arg || context_arg.kind !== 'class') throw new Error(`Invalid class decorator for "${context_arg.name}"!`);
    context_arg.addInitializer(registerElement.bind(globalThis, cls_or_tag, [...context_arg.name.match(elem_name_regex)]?.map(v => v.toLowerCase()).join('-')))
}

// Regex used in transforming a class name to an HTML tag.
const elem_name_regex = /[A-Z][a-z0-9_]*/g;

/**
 * Callback executed within the static initializer of an {@link ElementBase} descendant to register a custom element.
 * @param cls The class of the custom element to register.
 * @param tag_name The tag name of the custom element to register.
 */
function registerElement<T extends typeof ElementBase>(cls: T, tag_name: string) {
    if(!tag_name) throw new Error(`Invalid class decorator for "${cls.name}"`);
    if(document.head.querySelector(`#${tag_name}`)) return;
    document.addEventListener('DOMContentLoaded', () => {
        const template = document.head.appendChild(document.createElement('template'));
        template.id = tag_name;
        const style_string = cls.getStyle();
        if(style_string) {
            const sheet = new CSSStyleSheet();
            sheet.replace(style_string);
            template['constructedStylesheet'] = sheet;
        }
        template.innerHTML += cls.getTemplate();
        customElements.define(tag_name, cls as unknown as new() => HTMLElement);
    }, {once: true, passive: true})
}