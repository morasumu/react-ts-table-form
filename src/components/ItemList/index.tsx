import React, { useMemo, useEffect } from 'react';
import { useTable, useSortBy, Column } from 'react-table';
import { useResizeDetector } from 'react-resize-detector';
import { AiOutlineClose, AiOutlineCheck, AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import { BsQuestionSquare } from 'react-icons/bs';
import moment from 'moment';
import type { IItem } from 'types';
import styles from './index.module.scss';

interface IItemListProps {
  items: IItem[];
  onSelectRow: (identifier: string) => void;
}

interface IRowData {
  id: number;
  type: string;
  summary: string;
  isPrivate: boolean;
  status: string;
  service?: string;
  author: string;
  createdOn: string;
  updatedOn: string;
}

const hideColumnConfig: { [key: string]: number } = {
  'Summary': 400,
  'Author': 600,
  'Service': 768,
  'Updated': 800,
  'Created': 1024,
};

export const ItemList: React.FC<IItemListProps> = ({ items, onSelectRow }) => {
  const { width, ref } = useResizeDetector();

  const data: IRowData[] = useMemo(() => items.map(item => {
    const { entity: { data } } = item;
    return {
      id: data.id,
      type: data.number,
      summary: data.summary,
      isPrivate: data.isPrivate,
      status: data.status.name,
      service: data.service?.name,
      author: data.author.name,
      createdOn: data.createdOn,
      updatedOn: data.updatedOn,
    }
  }), [items])

  const formatDate = (strDate: string) => {
    return moment(strDate).format('DD/MM/YYYY HH:mm:ss')
  }

  const columns: readonly Column<IRowData>[] = useMemo(() => [
    {
      Header: 'Type #',
      accessor: 'type',
      Cell: props => <div className="flex items-center"><BsQuestionSquare className="mr-2" />{props.value}</div>
    },
    {
      Header: 'Summary',
      accessor: 'summary',

    },
    {
      Header: 'Private',
      accessor: 'isPrivate',
      Cell: props => props.value ? <AiOutlineCheck color='green' /> : <AiOutlineClose color="red" />,
      sortType: (rowA, rowB, id) => {
        if (rowA.values[id] && !rowB.values[id]) return -1;
        if (!rowA.values[id] && rowB.values[id]) return 1;
        return 0;
      },
    },
    {
      Header: 'Status',
      accessor: 'status',
      maxWidth: 100,
    },
    {
      Header: 'Service',
      accessor: 'service',
    },
    {
      Header: 'Author',
      accessor: 'author',
    },
    {
      Header: 'Created',
      accessor: 'createdOn',
      Cell: ({ value }) => formatDate(value),
    },
    {
      Header: 'Updated',
      accessor: 'updatedOn',
      Cell: ({ value }) => formatDate(value),
    },
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    allColumns,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy
  )

  useEffect(() => {
    Object.keys(hideColumnConfig)
      .forEach(headerName => allColumns
        .find(col => col.Header === headerName)?.toggleHidden(width! < hideColumnConfig[headerName]));
  }, [width, allColumns]);

  return (
    <div ref={ref} className="px-3">
      <table className={styles.table} {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th className="whitespace-nowrap" {...column.getHeaderProps(column.getSortByToggleProps())}>
                  <div className="flex items-center">
                    {column.render('Header')}
                    {column.isSorted
                      ? column.isSortedDesc
                        ? <AiOutlineArrowDown />
                        : <AiOutlineArrowUp />
                      : ''}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row)
            return (
              <tr
                {...row.getRowProps()}
                className="cursor-pointer"
                onClick={() => onSelectRow(row.values['type'])}>
                {row.cells.map(cell => {
                  return <td className="whitespace-nowrap text-ellipsis overflow-hidden px-3" {...cell.getCellProps()}>
                    {cell.render('Cell')}
                  </td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}