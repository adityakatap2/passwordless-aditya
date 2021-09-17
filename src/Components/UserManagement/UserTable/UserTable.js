import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { randomCreatedDate, randomUpdatedDate } from '@mui/x-data-grid-generator';
import HelpOutline from '@material-ui/icons/HelpOutline';
import { AppleOutlined, AndroidOutlined , MobileOutlined } from '@ant-design/icons'
import PersonIcon from '@material-ui/icons/Person';


const columns = [
  { field: 'applicationName' },
  { field: 'age', type: 'number' },
  {
    field: 'username',
    valueGetter: (params) =>
      `${params.getValue(params.id, 'applicationName') || 'unknown'} - ${
        params.getValue(params.id, 'age') || 'x'
      }`,
    sortComparator: (v1, v2, param1, param2) =>
      param1.api.getCellValue(param1.id, 'age') -
      param2.api.getCellValue(param2.id, 'age'),
    width: 150,
  },
  { field: 'dateCreated', type: 'date', width: 180 },
  { field: 'lastLogin', type: 'dateTime', width: 180 },
  { field: 'action', },

];

const rows = [
  {
    id: 1,
    applicationName: 'Damien',
    age: 25,
    dateCreated: randomCreatedDate(),
    lastLogin: randomUpdatedDate(),
    actions: <PersonIcon />
    
   
  },
  {
    id: 2,
    applicationName: 'Nicolas',
    age: 36,
    dateCreated: randomCreatedDate(),
    lastLogin: randomUpdatedDate(),
  },
  {
    id: 3,
    applicationName: 'Kate',
    age: 19,
    dateCreated: randomCreatedDate(),
    lastLogin: randomUpdatedDate(),
  },
  {
    id: 4,
    applicationName: 'Sebastien',
    age: 28,
    dateCreated: randomCreatedDate(),
    lastLogin: randomUpdatedDate(),
  },
  {
    id: 5,
    applicationName: 'Louise',
    age: 23,
    dateCreated: randomCreatedDate(),
    lastLogin: randomUpdatedDate(),
  },
  {
    id: 6,
    applicationName: 'George',
    age: 10,
    dateCreated: randomCreatedDate(),
    lastLogin: randomUpdatedDate(),
  },
];

export default function ComparatorSortingGrid() {
  const [sortModel, setSortModel] = React.useState([
    {
      field: 'username',
      sort: 'asc',
    },
  ]);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        sortModel={sortModel}
        rows={rows}
        columns={columns}
        onSortModelChange={(model) => setSortModel(model)}
       
      />
    </div>
  );
}


