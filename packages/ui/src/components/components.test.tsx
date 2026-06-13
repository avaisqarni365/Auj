import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from './Button';
import { Input } from './Input';
import { StatusPill } from './StatusPill';
import { Stepper } from './Stepper';
import { SegmentedControl } from './SegmentedControl';
import { Toggle } from './Toggle';
import { Logo } from './Logo';

describe('UI components render with the AUJ token classes', () => {
  it('Button defaults to the primary brand style', () => {
    const html = renderToStaticMarkup(<Button>Search</Button>);
    expect(html).toContain('Search');
    expect(html).toContain('bg-green-800');
    expect(html).toContain('type="button"');
  });

  it('Button accent + danger variants', () => {
    expect(renderToStaticMarkup(<Button variant="accent">Go</Button>)).toContain('bg-accent-600');
    expect(renderToStaticMarkup(<Button variant="danger">Del</Button>)).toContain('bg-danger');
  });

  it('Input renders a label and error helper with danger border', () => {
    const html = renderToStaticMarkup(<Input label="Passport" error="Required" />);
    expect(html).toContain('Passport');
    expect(html).toContain('Required');
    expect(html).toContain('border-danger');
    expect(html).toContain('aria-invalid="true"');
  });

  it('StatusPill maps tone to fg/bg classes', () => {
    expect(renderToStaticMarkup(<StatusPill tone="success">e-Visa</StatusPill>)).toContain('bg-success-bg');
    expect(renderToStaticMarkup(<StatusPill tone="info">Agent channel</StatusPill>)).toContain('text-info-fg');
  });

  it('Stepper disables minus at the minimum', () => {
    const html = renderToStaticMarkup(<Stepper value={1} min={1} max={49} />);
    expect(html).toContain('>1<');
    expect(html).toContain('aria-label="Decrease"');
    expect(html).toContain('disabled');
  });

  it('SegmentedControl marks the active option', () => {
    const html = renderToStaticMarkup(
      <SegmentedControl
        value="umrah"
        options={[
          { value: 'umrah', label: 'Umrah' },
          { value: 'hajj', label: 'Hajj' },
        ]}
      />,
    );
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('Umrah');
  });

  it('Toggle reflects checked state on the switch role', () => {
    expect(renderToStaticMarkup(<Toggle checked />)).toContain('aria-checked="true"');
    expect(renderToStaticMarkup(<Toggle checked={false} />)).toContain('bg-sand-300');
  });

  it('Logo renders the zenith mark (tile + arch + gold star) per colourway', () => {
    const primary = renderToStaticMarkup(<Logo />);
    expect(primary).toContain('#0F5132'); // green-800 tile
    expect(primary).toContain('#C8A24A'); // gold star
    expect(primary).toContain('M19 47V31'); // mihrab arch
    expect(renderToStaticMarkup(<Logo variant="onDark" />)).toContain('#07301E');
    expect(renderToStaticMarkup(<Logo variant="mono" />)).toContain('currentColor');
  });
});
