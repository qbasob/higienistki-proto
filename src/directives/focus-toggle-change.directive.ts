import { Directive, ElementRef, Renderer, HostListener } from '@angular/core';

@Directive({
    selector: "[focusToggleChange]"
})
export class FocusToggleChangeDirective {
    constructor(
        private el: ElementRef,
        private renderer: Renderer
    ) { }

    @HostListener('ionChange') onChange() {
        const btn = this.el.nativeElement.querySelector('button');
        // console.log("btn", btn);
        this.renderer.invokeElementMethod(btn, 'focus');
    }
}