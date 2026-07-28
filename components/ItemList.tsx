import type { ReactNode } from 'react';

export type ItemListRow = {
  key: string | number;
  iconSrc?: string;
  iconWidth?: number;
  iconHeight?: number;
  title: ReactNode;
  subtitle?: ReactNode;
  active?: boolean;
  wide?: boolean;
  onSelect: () => void;
};

type ItemListProps = {
  rows: ItemListRow[];
  listClassName?: string;
  contentWrapperClassName?: string;
};

function rowClassName(row: ItemListRow) {
  return ['dlc-list-item', row.wide && 'dlc-list-item--wide', row.active && 'dlc-list-item--active']
    .filter(Boolean)
    .join(' ');
}

function ItemContent({ row, wrapperClassName }: { row: ItemListRow; wrapperClassName?: string }) {
  const content = (
    <div className="dlc-list-item__content">
      <span className="dlc-list-item__content__title">{row.title}</span>
      {row.subtitle && <span className="dlc-list-item__content__subtitle">{row.subtitle}</span>}
    </div>
  );
  return wrapperClassName ? <div className={wrapperClassName}>{content}</div> : content;
}

export default function ItemList({ rows, listClassName, contentWrapperClassName }: ItemListProps) {
  return (
    <ul className={listClassName}>
      {rows.map((row) => (
        <li key={row.key} className={rowClassName(row)} onClick={row.onSelect}>
          {row.iconSrc && <img src={row.iconSrc} alt="" width={row.iconWidth} height={row.iconHeight} />}
          <ItemContent row={row} wrapperClassName={contentWrapperClassName} />
        </li>
      ))}
    </ul>
  );
}