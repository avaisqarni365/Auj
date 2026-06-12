import type { SearchCriteria } from '@auj/contracts';
import { Button, Card, SegmentedControl, Select, Stepper } from '@auj/ui';
import { t, type Locale } from '../i18n';

export interface HomeSearchProps {
  locale: Locale;
  criteria: SearchCriteria;
  onCity: (city: SearchCriteria['city']) => void;
  onPax: (pax: number) => void;
  onSearch: () => void;
}

export function HomeSearch({ locale, criteria, onCity, onPax, onSearch }: HomeSearchProps) {
  return (
    <Card className="p-5">
      <h1 className="font-serif text-3xl text-sand-ink">{t(locale, 'search')}</h1>
      <div className="mt-4 grid gap-3">
        <SegmentedControl
          value="UMRAH"
          options={[
            { value: 'UMRAH', label: 'Umrah' },
            { value: 'HAJJ', label: 'Hajj' },
            { value: 'ZIYARAT', label: 'Ziyarat' },
          ]}
        />
        <Select label="Destination" value={criteria.city} onChange={(e) => onCity(e.target.value as SearchCriteria['city'])}>
          <option value="MAKKAH">Makkah</option>
          <option value="MADINAH">Madinah</option>
          <option value="JEDDAH">Jeddah</option>
        </Select>
        <div className="flex items-center justify-between">
          <span className="text-sm text-sand-700">{t(locale, 'pilgrims')}</span>
          <Stepper value={criteria.pax} min={1} max={49} onChange={onPax} />
        </div>
        <Button onClick={onSearch}>{t(locale, 'search')}</Button>
      </div>
    </Card>
  );
}
