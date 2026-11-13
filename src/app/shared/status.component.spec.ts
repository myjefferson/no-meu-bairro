import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { StatusComponent } from './status.component';

describe('StatusComponent', () => {
  it('exibe o estado por texto e símbolo', () => {
    const fixture = TestBed.createComponent(StatusComponent);
    fixture.componentRef.setInput('status', 'em_analise');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Em análise');
    expect(fixture.nativeElement.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });
});
