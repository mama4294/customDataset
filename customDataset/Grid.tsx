import * as React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableCellLayout,
  Link,
  Tooltip,
  makeStyles,
} from "@fluentui/react-components";

export interface CellValue {
  analysisId: string;
  value: string;
  unit: string;
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
const useStyles = makeStyles({
  scrollContainer: {
    overflowX: "auto",
    width: "100%",
    borderRadius: "8px",
    border: "1px solid #ddd",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  table: {
    minWidth: "1000px",
    width: "max-content",
    borderCollapse: "separate",
    borderSpacing: 0,
    fontFamily: "'Segoe UI', sans-serif",
    fontSize: "14px",
    color: "#323130",
  },
  th: {
    backgroundColor: "#f3f2f1",
    padding: "10px 12px",
    borderBottom: "1px solid #edebe9",
    textAlign: "center",
    fontWeight: 600,
    position: "sticky",
    top: 0,
    zIndex: 1,
    lineHeight: "48px", // Match the td height
    minHeight: "48px",
  },
  td: {
    textAlign: "center",
    padding: "16px 12px",
    borderBottom: "1px solid #edebe9",
    backgroundColor: "#ffffff",
    verticalAlign: "top",
    cursor: "pointer",
    lineHeight: "48px", // Ensures taller rows
    minHeight: "48px", // Optional fallback
  },
  stickyRow: {
    position: "sticky",
    left: 0,
    backgroundColor: "#ffffff",
    zIndex: 1,
    boxShadow: "2px 0 4px -2px rgba(0, 0, 0, 0.1)",
  },
  stickyColumn: {
    position: "sticky",
    left: 0,
    backgroundColor: "#ffffff",
    zIndex: 2,
    boxShadow: "2px 0 4px -2px rgba(0, 0, 0, 0.1)", // subtle shadow on sticky column
  },
  rowCell: {
    ":hover": {
      backgroundColor: "#f9f9f9",
      borderBottom: "1px solidrgb(43, 163, 255)",
    },
  },
  noSamples: {
    padding: "20px",
    textAlign: "center",
    color: "#a19f9d",
  },
});

//TODO: improve navigation to sample records

// private navigateToRecord(id: string): void {
//   let record: any = this.theContext.parameters.listDataSet.records[id].getNamedReference();
//   console.log(record);
//   this.theContext.navigation.openForm({
//       entityName: record.entityName,
//       entityId: record.id,
//   });
// }

export const Grid = (props: IHelloWorldProps) => {
  const classes = useStyles();

  if (props.data.length === 0) {
    return <div className={classes.noSamples}>No samples</div>;
  }

  return (
    <div className={classes.scrollContainer}>
      <table className={classes.table}>
        <thead>
          <tr>
            <th className={`${classes.th} ${classes.stickyColumn}`}>
              Sample ID
            </th>
            {props.methods.map((method) => (
              <th className={classes.th} key={method}>
                {method}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.data.map((row) => (
            <tr key={row.sampleId}>
              <td className={`${classes.td} ${classes.stickyColumn}`}>
                <Link
                  href={`https://org8ef10ef2.crm.dynamics.com/main.aspx?appid=4a63b923-360f-f011-9989-7c1e526b30e9&pagetype=entityrecord&etn=cr2b6_sample&id=${row.sampleGuid}`}
                  target="_blank"
                >
                  {row.sampleName}
                </Link>
              </td>
              {props.methods.map((method) => {
                const cell = row[method] as CellValue | undefined;

                let displayText = "";
                let backgroundColor = "transparent";
                let expectedText = `Expected: ${cell?.expected ?? ""}`;

                if (!cell?.required) {
                  displayText = "N/A";
                  backgroundColor = "#eee";
                  expectedText = "Not required";
                } else if (!cell.value) {
                  displayText = "";
                  backgroundColor = "#ffff99";
                } else {
                  displayText = `${cell.value} ${cell.unit ?? ""}`;
                }

                return (
                  <Tooltip
                    withArrow
                    content={expectedText}
                    relationship="description"
                    key={method}
                  >
                    <td
                      className={`${classes.td} ${classes.rowCell}`}
                      style={{ backgroundColor }}
                    >
                      {displayText}
                    </td>
                  </Tooltip>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// export const Grid = (props: IHelloWorldProps) => {
//   const classes = useStyles();

//   return (
//     <div className={classes.scrollContainer}>
//       <Table className={classes.table}>
//         <TableHeader>
//           <TableRow>
//             <TableHeaderCell>Sample ID</TableHeaderCell>
//             {props.methods.map((method) => (
//               <TableHeaderCell key={method}>{method}</TableHeaderCell>
//             ))}
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {props.data.map((row) => (
//             <TableRow key={row.sampleId}>
//               <TableCell>
//                 <TableCellLayout truncate>
//                   <Link
//                     href={`https://org8ef10ef2.crm.dynamics.com/main.aspx?appid=4a63b923-360f-f011-9989-7c1e526b30e9&pagetype=entityrecord&etn=cr2b6_sample&id=${row.sampleGuid}`}
//                     target="_blank"
//                   >
//                     {row.sampleName}
//                   </Link>
//                 </TableCellLayout>
//               </TableCell>
//               {props.methods.map((method) => {
//                 const cell = row[method] as CellValue | undefined;

//                 let displayText = "";
//                 let backgroundColor = "transparent";
//                 let expectedText = `Expected: ${cell?.expected ?? ""}`;

//                 if (!cell?.required) {
//                   displayText = "N/A";
//                   backgroundColor = "#eee";
//                   expectedText = "Not required";
//                 } else if (!cell.value) {
//                   displayText = "";
//                   backgroundColor = "#ffff99";
//                 } else {
//                   displayText = `${cell.value} ${cell.unit ?? ""}`;
//                 }

//                 return (
//                   <Tooltip
//                     content={expectedText}
//                     relationship="description"
//                     key={method}
//                   >
//                     <TableCell
//                       style={{
//                         backgroundColor,
//                       }}
//                     >
//                       <div>{displayText}</div>
//                     </TableCell>
//                   </Tooltip>
//                 );
//               })}
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };
