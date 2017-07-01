// @flow
// Used in HomePage.js to display database contents
export type PaginationType = {
  total: number,
  defaultCurrent?: number,
  current?: number,
  defaultPageSize?: number,
  pageSize?: number,
  onChange?: (page: number, pageSize: number) => void,
  showSizeChanger?: boolean,
  pageSizeOptions?: string[],
  onShowSizeChange?: (current: number, size: number) => void,
  showQuickJumper?: boolean,
  size?: string,
  simple?: boolean,
  locale?: Object,
  className?: string,
  prefixCls?: string,
  selectPrefixCls?: string
};

export type SorterType = boolean | ((a: any, b: any) => number);

export type SortedInfoType = {
  order: 'ascend' | 'descend' | false,
  columnKey: string
};
