import type { SpacerBlock } from '@roua/db';

const SIZES = { sm: 'h-12', md: 'h-24', lg: 'h-40', xl: 'h-64' } as const;

export function Spacer({ block }: { block: SpacerBlock }) {
  return <div className={SIZES[block.size]} aria-hidden />;
}
