import * as React from "react";
import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn,
  Link,
  Tooltip,
} from "@fluentui/react-components";

export interface CellValue {
  analysisId: string;
  value: string;
  expected: string;
  required: boolean;
}

export interface Row {
  sampleId: string;
  sampleName: string;
  sampleGuid: string;
  [method: string]: string | CellValue;
}

export interface IHelloWorldProps {
  data: Row[];
  methods: string[];
}
export const Grid = (props: IHelloWorldProps) => {
  const columns: TableColumnDefinition<Row>[] = [
    createTableColumn<Row>({
      columnId: "sampleName",
      renderHeaderCell: () => "Sample ID",
      renderCell: (item) => (
        <TableCellLayout truncate>
          <Link
            href={`https://org8ef10ef2.crm.dynamics.com/main.aspx?appid=4a63b923-360f-f011-9989-7c1e526b30e9&pagetype=entityrecord&etn=cr2b6_sample&id=${item.sampleGuid}`}
            target="_blank"
          >
            {item.sampleName}
          </Link>
        </TableCellLayout>
      ),
    }),
    ...props.methods.map((method) =>
      createTableColumn<Row>({
        columnId: method,
        renderHeaderCell: () => method,
        renderCell: (item) => {
          const cell = item[method] as CellValue;
          return (
            <TableCellLayout truncate>
              <Tooltip
                relationship="description"
                content={`Expected: ${cell?.expected ?? ""}`}
              >
                <div
                  style={{
                    backgroundColor: cell?.required ? "transparent" : "#eee",
                    textAlign: "center",
                  }}
                >
                  {cell?.value ?? ""}
                </div>
              </Tooltip>
            </TableCellLayout>
          );
        },
      })
    ),
  ];

  return (
    <DataGrid
      items={props.data}
      columns={columns}
      getRowId={(row: Row) => row.sampleId}
      resizableColumnsOptions={{
        autoFitColumns: false,
      }}
      resizableColumns
    >
      <DataGridHeader>
        <DataGridRow>
          {({ renderHeaderCell }) => (
            <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
          )}
        </DataGridRow>
      </DataGridHeader>
      <DataGridBody>
        {({ item, rowId }) => (
          <DataGridRow key={rowId}>
            {({ renderCell }) => (
              <DataGridCell>{renderCell(item)}</DataGridCell>
            )}
          </DataGridRow>
        )}
      </DataGridBody>
    </DataGrid>
  );
};

// export interface CellValue {
//   analysisId: string;
//   value: string;
//   expected: string;
//   required: boolean;
// }

// export interface Row {
//   sampleId: string;
//   sampleName: string;
//   sampleGuid: string;
//   [method: string]: string | CellValue;
// }

// export interface IHelloWorldProps {
//   data: Row[];
//   methods: string[];
// }

// export const Grid = (props: IHelloWorldProps) => {
//   return (
//     <DataGrid
//       items={props.data}
//       columns={[
//         {
//           columnId: "sampleName",
//           renderHeaderCell: () => "Sample ID",
//           renderCell: (item) => (
//             <Link
//               href={`https://org8ef10ef2.crm.dynamics.com/main.aspx?appid=4a63b923-360f-f011-9989-7c1e526b30e9&pagetype=entityrecord&etn=cr2b6_sample&id=${item.sampleGuid}`}
//               target="_blank"
//             >
//               {item.sampleName}
//             </Link>
//           ),
//         },
//         ...props.methods.map((method) => ({
//           columnId: method,
//           renderHeaderCell: () => method,
//           renderCell: (item: Row) => {
//             const cell = item[method] as CellValue;
//             return (
//               <Tooltip
//                 content={`Expected: ${cell?.expected ?? ""}`}
//                 relationship="label"
//               >
//                 <div
//                   style={{
//                     backgroundColor: cell?.required ? "transparent" : "#eee",
//                     textAlign: "center",
//                   }}
//                 >
//                   {cell?.value ?? ""}
//                 </div>
//               </Tooltip>
//             );
//           },
//         })),
//       ]}
//     >
//       <DataGridHeader>
//         {(header) => (
//           <DataGridRow>
//             {header.columns.map((column) => (
//               <DataGridHeaderCell key={column.columnId}>
//                 {column.renderHeaderCell()}
//               </DataGridHeaderCell>
//             ))}
//           </DataGridRow>
//         )}
//       </DataGridHeader>
//       <DataGridBody>
//         {(row) => (
//           <DataGridRow key={row.item.sampleId}>
//             {row.columns.map((column) => (
//               <DataGridCell key={column.columnId}>
//                 {column.renderCell(row.item)}
//               </DataGridCell>
//             ))}
//           </DataGridRow>
//         )}
//       </DataGridBody>
//     </DataGrid>
//   );
// };
