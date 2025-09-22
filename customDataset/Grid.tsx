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
    fontSize: "12px",
  },
  headerCell: {
    position: "sticky",
    top: 0,
    zIndex: 3,
    backgroundColor: "#f3f2f1",
    borderBottom: "1px solid #edebe9",
    textAlign: "center",
    fontWeight: 600,
    height: "36px",
    padding: 0,
  },
  stickyColumn: {
    position: "sticky",
    left: 0,
    backgroundColor: "#ffffff",
    zIndex: 2,
    boxShadow: "2px 0 4px -2px rgba(0, 0, 0, 0.1)",
  },
  cell: {
    textAlign: "center",
    verticalAlign: "middle",
    height: "36px",
    borderBottom: "1px solid #edebe9",
    padding: 0,
  },
  cellInner: {
    padding: "0 8px",
    width: "100%",
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  rowHover: {
    ":hover": {
      backgroundColor: "#fafafa",
    },
  },
  rowEven: {
    backgroundColor: "#fcfcfc",
  },
  headerInnerLeft: {
    padding: "0 8px",
    width: "100%",
    textAlign: "left",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    position: "relative",
  },
  headerInnerCenter: {
    padding: "0 8px",
    width: "100%",
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    position: "relative",
  },
  resizer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "6px",
    height: "100%",
    cursor: "col-resize",
    userSelect: "none",
  },
  leftAlignedCellInner: {
    padding: "0 8px",
    width: "100%",
    textAlign: "left",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
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

  // Column sizing state (sample column + method columns)
  const SAMPLE_COL = "__sample__";
  const [colWidths, setColWidths] = React.useState<Record<string, number>>({
    [SAMPLE_COL]: 220,
  });

  // Ensure widths for any new methods without clobbering existing sizes
  React.useEffect(() => {
    setColWidths((w) => {
      const next = { ...w };
      if (next[SAMPLE_COL] == null) next[SAMPLE_COL] = 220;
      for (const m of props.methods) {
        if (next[m] == null) next[m] = 140;
      }
      return next;
    });
  }, [props.methods]);

  // Resizing logic
  const resizingRef = React.useRef<{
    key: string | null;
    startX: number;
    startWidth: number;
  }>({ key: null, startX: 0, startWidth: 0 });

  const onMouseDownResize = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = colWidths[key] ?? 120;
    resizingRef.current = { key, startX, startWidth };

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - resizingRef.current.startX;
      const newWidth = Math.max(
        80,
        Math.min(600, resizingRef.current.startWidth + dx)
      );
      const k = resizingRef.current.key;
      if (!k) return;
      setColWidths((w) => (w[k] === newWidth ? w : { ...w, [k]: newWidth }));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      resizingRef.current = { key: null, startX: 0, startWidth: 0 };
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (props.data.length === 0) {
    return <div className={classes.noSamples}>No samples</div>;
  }

  return (
    <div className={classes.scrollContainer}>
      <Table className={classes.table}>
        <TableHeader>
          <TableRow>
            <TableHeaderCell
              className={`${classes.headerCell} ${classes.stickyColumn}`}
              style={{
                width: colWidths[SAMPLE_COL],
                minWidth: colWidths[SAMPLE_COL],
              }}
            >
              <div className={classes.headerInnerLeft}>
                Sample ID
                <div
                  className={classes.resizer}
                  onMouseDown={(e) => onMouseDownResize(e, SAMPLE_COL)}
                />
              </div>
            </TableHeaderCell>
            {props.methods.map((method) => (
              <TableHeaderCell
                className={classes.headerCell}
                key={method}
                style={{
                  width: colWidths[method],
                  minWidth: colWidths[method],
                }}
              >
                <div className={classes.headerInnerCenter}>
                  {method}
                  <div
                    className={classes.resizer}
                    onMouseDown={(e) => onMouseDownResize(e, method)}
                  />
                </div>
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.data.map((row, idx) => (
            <TableRow
              key={row.sampleId}
              className={`${classes.rowHover} ${
                idx % 2 === 0 ? classes.rowEven : ""
              }`}
            >
              <TableCell
                className={`${classes.cell} ${classes.stickyColumn}`}
                style={{
                  width: colWidths[SAMPLE_COL],
                  minWidth: colWidths[SAMPLE_COL],
                }}
              >
                <div className={classes.leftAlignedCellInner}>
                  <Link
                    href={`https://org8ef10ef2.crm.dynamics.com/main.aspx?appid=4a63b923-360f-f011-9989-7c1e526b30e9&pagetype=entityrecord&etn=cr2b6_sample&id=${row.sampleGuid}`}
                    target="_blank"
                  >
                    {row.sampleName}
                  </Link>
                </div>
              </TableCell>
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
                  <TableCell
                    key={method}
                    className={classes.cell}
                    style={{
                      backgroundColor,
                      width: colWidths[method],
                      minWidth: colWidths[method],
                    }}
                  >
                    <Tooltip
                      withArrow
                      content={expectedText}
                      relationship="description"
                    >
                      <div className={classes.cellInner}>{displayText}</div>
                    </Tooltip>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
