import type { ReactElement, ReactNode } from 'react';

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
}

export function DataTable<TRow>({
  columns,
  data,
  getRowKey,
  emptyMessage,
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
          data.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
