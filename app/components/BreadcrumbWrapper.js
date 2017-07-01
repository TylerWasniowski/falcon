// @flow
import React from 'react';
import { Breadcrumb } from 'antd';

type Props = {
  routeItems: Array<string>
};

export default function BreadcrumbWrapper(props: Props) {
  return (
    <Breadcrumb style={{ margin: '12px 0', padding: '0 50px' }}>
      {props.routeItems.map(e =>
        (<Breadcrumb.Item key={e}>
          {e}
        </Breadcrumb.Item>)
      )}
    </Breadcrumb>
  );
}
