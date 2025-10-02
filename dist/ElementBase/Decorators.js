export function childRef(selector_or_val, context) {
    if (typeof selector_or_val === 'string') {
        return ((value, context) => {
            return {
                set(_value) { }, // makes this readonly
                init(_value) {
                    return this.createChildRef('strong', selector_or_val);
                },
            };
        });
    }
    return {
        set(_value) { }, // makes this readonly
        init(_value) {
            return this.createChildRef('strong', `#${String(context.name)}`);
        },
    };
}
export function customElement(cls_or_tag, context_arg) {
    if (typeof cls_or_tag === 'string') {
        return (cls, context) => {
            if (!context || context.kind !== 'class')
                throw new Error(`Invalid class decorator for "${context.name}"!`);
            context.addInitializer(registerElement.bind(globalThis, cls, cls_or_tag));
        };
    }
    if (!context_arg || context_arg.kind !== 'class')
        throw new Error(`Invalid class decorator for "${context_arg.name}"!`);
    context_arg.addInitializer(registerElement.bind(globalThis, cls_or_tag, [...context_arg.name.match(elem_name_regex)]?.map(v => v.toLowerCase()).join('-')));
}
// Regex used in transforming a class name to an HTML tag.
const elem_name_regex = /[A-Z][a-z0-9_]*/g;
/**
 * Callback executed within the static initializer of an {@link ElementBase} descendant to register a custom element.
 * @param cls The class of the custom element to register.
 * @param tag_name The tag name of the custom element to register.
 */
function registerElement(cls, tag_name) {
    if (!tag_name)
        throw new Error(`Invalid class decorator for "${cls.name}"`);
    if (document.head.querySelector(`#${tag_name}`))
        return;
    document.addEventListener('DOMContentLoaded', () => {
        const template = document.head.appendChild(document.createElement('template'));
        template.id = tag_name;
        const style_string = cls.getStyle();
        if (style_string) {
            const sheet = new CSSStyleSheet();
            sheet.replace(style_string);
            template['constructedStylesheet'] = sheet;
        }
        template.innerHTML += cls.getTemplate();
        customElements.define(tag_name, cls);
    }, { once: true, passive: true });
}
//# sourceMappingURL=Decorators.js.map