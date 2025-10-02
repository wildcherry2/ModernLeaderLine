import type { ElementBase, TElementBaseChildRefDecoratorFactory, TElementBaseCustomElementDecoratorFactory } from "./Component";
/**
 * Field accessor decorator to initialize a field to the element returned by querying the given selector
 * on the {@link ElementBase}'s shadow root, or the {@link ElementBase} itself, by invoking
 * {@link ElementBase.createChildRef}.
 * @param selector The selector to query.
 */
export declare function childRef<T extends Element>(selector: string): TElementBaseChildRefDecoratorFactory<T>;
/**
 * Default field accessor decorator to initialize a field to the element returned by querying the selector formed from
 * appending the field's name to a '#' string (effectively using the field's name to form an ID selector) on the
 * {@link ElementBase}'s shadow root, or the {@link ElementBase} itself, by invoking {@link ElementBase.createChildRef}.
 */
export declare function childRef<T extends Element>(value: ClassAccessorDecoratorTarget<ElementBase, T>, context: ClassAccessorDecoratorContext<ElementBase, T>): ClassAccessorDecoratorResult<ElementBase, T>;
/**
 * Class decorator to register the class as a custom HTML element in a static initializer.
 * @param tag_name The tag name to use for this custom HTML element.
 */
export declare function customElement<T extends typeof ElementBase>(tag_name: string): TElementBaseCustomElementDecoratorFactory<T>;
/**
 * Default class decorator to register the class as a custom HTML element in a static initializer.
 * Generates the tag name automatically by separating capital-case substrings and concatenating them with dashes.
 */
export declare function customElement<T extends typeof ElementBase>(cls: T, context: ClassDecoratorContext<T>): void;
