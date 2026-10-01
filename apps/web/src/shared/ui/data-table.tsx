import { Fragment, type ReactElement, type ReactNode } from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';

export interface IDataTableColumn<TRow> {
  key: string;
  header: ReactNode;
  cell: (row: TRow) => ReactNode;
  className?: string;
}

export interface DataTableProps<TRow> {
  columns: IDataTableColumn<TRow>[];
  data: TRow[];
  getRowKey: (row: TRow) => string;
  emptyMessage: ReactNode;
  /** Content rendered in an extra full-width row right below a row, when `isRowExpanded(row)` is true. */
  renderExpandedRow?: (row: TRow) => ReactNode;
  isRowExpanded?: (row: TRow) => boolean;
}

export function DataTable<TRow>({
  columns,
  data,
  getRowKey,
  emptyMessage,
  renderExpandedRow,
  isRowExpanded,
}: DataTableProps<TRow>): ReactElement {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key} className={column.className}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length}>{emptyMessage}</TableCell>
          </TableRow>
        ) : (
          data.map((row) => {
            const expanded = Boolean(renderExpandedRow && isRowExpanded?.(row));

            return (
              <Fragment key={getRowKey(row)}>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
                {expanded ? (
                  <TableRow>
                    <TableCell colSpan={columns.length}>{renderExpandedRow?.(row)}</TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
