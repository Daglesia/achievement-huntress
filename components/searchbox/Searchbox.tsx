import MagnifyingGlassIcon from './MagnifyingGlassIcon';

type SearchBoxProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  wrapperClassName?: string;
  topOfList?: boolean;
};

export default function SearchBox({
  id,
  value,
  onChange,
  placeholder,
  wrapperClassName,
  topOfList,
}: SearchBoxProps) {
  return (
    <div className={wrapperClassName}>
      <div className={`dlc-searchbox ${topOfList ? 'dlc-searchbox--top-of-list' : ''}`}>
        <span className="dlc-searchbox__icon" aria-hidden="true">
          <MagnifyingGlassIcon />
        </span>
        <input
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="dlc-searchbox__text-field"
        />
      </div>
    </div>
  );
}