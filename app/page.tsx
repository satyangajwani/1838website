import { Masthead } from '@/components/copy/masthead';
import { Marks } from '@/components/copy/marks';
import { Plaque } from '@/components/copy/plaque';
import { Proposition } from '@/components/copy/proposition';
import { Grain } from '@/components/system/grain';
import { Stage } from '@/components/stage/stage';
import { InterestSheet } from '@/components/interest/sheet';

export default function Home() {
  return <><a className="skip-link" href="#express-interest">Skip to Express Interest</a><Stage><header className="stage-header"><Masthead /><Proposition /></header><Plaque /><Marks /><InterestSheet /></Stage><Grain /></>;
}
