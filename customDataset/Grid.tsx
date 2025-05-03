import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
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
  return (
    <Table aria-label="Pivoted Sample Data Table">
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Sample ID</TableHeaderCell>
          {props.methods.map((method) => (
            <TableHeaderCell key={method}>
              {" "}
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {method}
              </div>
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.data.map((row, idx) => (
          <TableRow key={idx}>
            <TableCell>
              <Link
                href={`https://org8ef10ef2.crm.dynamics.com/main.aspx?appid=4a63b923-360f-f011-9989-7c1e526b30e9&pagetype=entityrecord&etn=cr2b6_sample&id=${row.sampleGuid}`}
              >
                {row.sampleName}
              </Link>
            </TableCell>
            {props.methods.map((method) => (
              <TableCell
                style={{
                  textAlign: "center",
                  backgroundColor: (row[method] as CellValue)?.required
                    ? "transparent"
                    : "#eee",
                }}
                key={method}
              >
                <Tooltip
                  content={`Expected: ${(row[method] as CellValue)?.expected}`}
                  relationship="label"
                  {...props}
                >
                  <p>
                    {(row[method] as CellValue)?.value
                      ? (row[method] as CellValue).value
                      : null}
                  </p>
                </Tooltip>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
