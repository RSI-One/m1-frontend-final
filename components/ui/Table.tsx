'use client';

type TableColumn<T = Record<string, any>> = {
  key?: string;
  label: string;
  muted?: boolean;
  render?: (row: T) => string;
};

type TableProps<T = Record<string, any>> = {
  columns: TableColumn<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  emptyText?: string;
};

export default function Table<T extends Record<string, any>>({ columns, rows, onRowClick, emptyText }: TableProps<T>) {
  if (!rows || !rows.length) {
    return (
      <div className="sheet-wrap">
        <table className="sheet">
          <tbody>
            <tr className="row-empty">
              <td colSpan={columns.length}>{emptyText || 'No records yet.'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="sheet-wrap">
      <table className="sheet">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key || c.label}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={String((row as any).id ?? idx)}
              data-row-idx={idx}
              onClick={() => onRowClick && onRowClick(row)}
              style={onRowClick ? { cursor: 'pointer' } : {}}
            >
              {columns.map((c) => (
                <td key={c.key || c.label} className={c.muted ? 'muted-cell' : ''}>
                  {c.render
                    ? <span dangerouslySetInnerHTML={{ __html: c.render(row) }} />
                    : String((row as any)[c.key ?? ''] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
