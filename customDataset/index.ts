import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { Grid, IHelloWorldProps } from "./Grid";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import * as React from "react";
import { CellValue, Row } from "./Grid";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
import Loading from "./Loading";
type DataSet = ComponentFramework.PropertyTypes.DataSet;

//https://www.youtube.com/watch?v=897DPWMJQ20&t=8461s
//Video on how to build PCF with React
//CD Solution
//pac solution init --publisher-name mmalone --publisher-prefix mmalone
// pac solution add-reference --path /Users/matthewmalone/Documents/Builds/PowerApps/customDataset
//CD customDataset
//pac pcf push --publisher-prefix mmalone
//npm run start (to run with local web server)

export class samplesPivotTable
  implements ComponentFramework.ReactControl<IInputs, IOutputs>
{
  private notifyOutputChanged: () => void;
  private context: ComponentFramework.Context<IInputs>;
  private container: HTMLDivElement;

  /**
   * Empty constructor.
   */
  constructor() {
    // Empty
  }

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.context = context;
    this.notifyOutputChanged = notifyOutputChanged;
    this.container = container;
  }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   * @returns ReactElement root react element for the control
   */
  public updateView(
    context: ComponentFramework.Context<IInputs>
  ): React.ReactElement {
    const analysesDataset = context.parameters.analysisDataset;
    const sampleDataset = context.parameters.sampleDataSet;

    // Check if datasets are available and have records
    console.log("=== Initial Dataset Check ===");
    console.log("analysesDataset exists:", !!analysesDataset);
    console.log("sampleDataset exists:", !!sampleDataset);
    console.log(
      "analysesDataset.sortedRecordIds exists:",
      !!analysesDataset?.sortedRecordIds
    );
    console.log(
      "sampleDataset.sortedRecordIds exists:",
      !!sampleDataset?.sortedRecordIds
    );
    console.log(
      "analysesDataset.sortedRecordIds length:",
      analysesDataset?.sortedRecordIds?.length || 0
    );
    console.log(
      "sampleDataset.sortedRecordIds length:",
      sampleDataset?.sortedRecordIds?.length || 0
    );

    if (
      !analysesDataset?.sortedRecordIds ||
      !sampleDataset?.sortedRecordIds ||
      analysesDataset.sortedRecordIds.length === 0 ||
      sampleDataset.sortedRecordIds.length === 0
    ) {
      console.log("Returning Loading component - datasets not ready");
      return React.createElement(
        FluentProvider,
        { theme: webLightTheme },
        React.createElement(Loading)
      );
    }

    // Helper utilities to resolve values by display/internal names
    const isFilled = (v: any) => v !== undefined && v !== null && v !== "";
    const stripParens = (s: string | undefined) =>
      (s ?? "")
        .replace(/\s*\([^)]*\)\s*/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
    const getFieldValue = (
      record: DataSetInterfaces.EntityRecord,
      dataset: DataSet,
      label: string
    ): any => {
      // Try with provided label first
      let v = record.getValue(label);
      if (!isFilled(v)) v = record.getFormattedValue(label);
      if (isFilled(v)) return v;

      // Try matching a column by name or displayName, ignoring parenthetical parts
      const normalized = stripParens(label);
      const col = dataset.columns.find(
        (c) =>
          c.displayName === label ||
          c.name === label ||
          stripParens(c.displayName) === normalized ||
          stripParens(c.name) === normalized
      );
      if (col) {
        v = record.getValue(col.name);
        if (!isFilled(v)) v = record.getFormattedValue(col.name);
      }
      return isFilled(v) ? v : undefined;
    };
    const getFirstValue = (
      record: DataSetInterfaces.EntityRecord,
      dataset: DataSet,
      labels: string[]
    ): any => {
      for (const lbl of labels) {
        const v = getFieldValue(record, dataset, lbl);
        if (isFilled(v)) return v;
      }
      return undefined;
    };
    const toStringSafe = (v: any): string | undefined =>
      typeof v === "string" ? v : typeof v === "number" ? String(v) : undefined;

    // Log the datasets for debugging
    const version = "0.0.20";
    console.log(
      `Version ${version} - Unified CSV/Production Support with improved lookup handling`
    );
    console.log("Analysis dataset available:", !!analysesDataset);
    console.log("Sample dataset available:", !!sampleDataset);
    console.log(
      "Analysis records count:",
      analysesDataset?.sortedRecordIds?.length || 0
    );
    console.log(
      "Sample records count:",
      sampleDataset?.sortedRecordIds?.length || 0
    );
    console.log("Analysis records:", analysesDataset.records);
    console.log("Sample records:", sampleDataset.records);

    console.log("=== Sample Dataset Details ===");
    console.log(
      "Sample columns:",
      sampleDataset.columns.map((c) => `${c.name} (${c.displayName})`)
    );
    console.log("=== Sample Record IDs ===");
    sampleDataset.sortedRecordIds.forEach((recordId) => {
      const record = sampleDataset.records[recordId];
      const name = getFirstValue(record, sampleDataset, [
        "Name",
        "ID",
        "cr2b6_name",
        "Sample",
        "name",
      ]);
      console.log(
        `Sample ID: ${recordId}, Name: ${name}, GUID: ${record.getRecordId()}`
      );
    });

    //get a list of sample IDs from the sample dataset
    const validSampleGuids = new Set(
      sampleDataset.sortedRecordIds.map((id) => {
        const record = sampleDataset.records[id];
        const recordId = record.getRecordId();
        console.log(`Sample Record - ID: ${id}, RecordId: ${recordId}`);
        // In test mode, use the dataset ID instead of GUID
        return recordId === id ? id : recordId;
      })
    );

    // Also create a map of sample names to IDs for easier lookup
    const sampleNameToId = new Map<string, string>(
      sampleDataset.sortedRecordIds
        .map((id) => {
          const record = sampleDataset.records[id];
          const recordId = record.getRecordId();
          const actualId = recordId === id ? id : recordId;
          const sampleNameRaw = getFirstValue(record, sampleDataset, [
            "Name",
            "ID",
            "cr2b6_name",
            "Sample",
            "name",
          ]) as string | undefined;
          const sampleName =
            typeof sampleNameRaw === "string"
              ? sampleNameRaw.trim()
              : undefined;
          return sampleName
            ? ([sampleName, actualId] as [string, string])
            : null;
        })
        .filter((entry): entry is [string, string] => entry !== null)
    );

    console.log("Valid Sample GUIDs:", Array.from(validSampleGuids));
    console.log(
      "Sample Name to ID map (entries):",
      Array.from(sampleNameToId.entries())
    );
    console.log("analysis dataset:", analysesDataset);
    if (analysesDataset.sortedRecordIds.length > 0) {
      const firstAnalysisRecordId = analysesDataset.sortedRecordIds[0];
      const firstAnalysisRecord =
        analysesDataset.records[firstAnalysisRecordId];
      console.log("First Analysis", firstAnalysisRecord);
      console.log("First Analysis Record Values:");
      analysesDataset.columns.forEach((col) => {
        const val = firstAnalysisRecord.getValue(col.name);
        const formattedVal = firstAnalysisRecord.getFormattedValue(col.name);
        console.log(
          `  ${col.name} (${col.displayName}):`,
          val,
          "(formatted:",
          formattedVal,
          ")"
        );
      });
    }
    console.log(
      "analysis dataset sorted record ids:",
      analysesDataset.sortedRecordIds.length
    );
    console.log(
      "analysis dataset columns:",
      analysesDataset.columns.map((c) => `${c.name} (${c.displayName})`)
    );

    const hasSampleNameMap = sampleNameToId.size > 0;
    console.log(
      "Has sampleNameToId map:",
      hasSampleNameMap,
      "size:",
      sampleNameToId.size
    );
    // Filter analysis records to only include those with valid sample IDs or at least a sample name when falling back
    console.log("=== Debugging Analysis Dataset ===");
    console.log("Total RecordIds:", analysesDataset?.sortedRecordIds?.length);
    console.log("Valid Sample GUIDs:", Array.from(validSampleGuids));
    console.log(
      "Available columns:",
      analysesDataset.columns.map((c) => c.name)
    );

    const filteredAnalysisRecordIds = analysesDataset.sortedRecordIds.filter(
      (recordId, index) => {
        const record = analysesDataset.records[recordId];
        if (!record) return false;

        let sampleName: string | undefined;
        let matchedSampleId: string | undefined;

        // Method 1: Try direct sample name from CSV development data (Sample column or cr2b6_samplename)
        const directSampleNameAny = getFirstValue(record, analysesDataset, [
          "Sample", // CSV dev data has Sample column with direct names
          "cr2b6_samplename",
          "sampleName",
        ]);
        const directSampleName = toStringSafe(directSampleNameAny)?.trim();
        if (directSampleName) {
          sampleName = directSampleName;

          // For development mode, the sample name IS the identifier
          // Try to map to a sample ID if we have the mapping
          if (hasSampleNameMap && sampleNameToId.has(sampleName)) {
            matchedSampleId = sampleNameToId.get(sampleName)!;
          } else {
            // Fallback: use sampleName as ID for CSV data
            matchedSampleId = sampleName;
          }
        }
        // Method 2: Try sample ID reference from CSV development data (cr2b6_sampleid)
        else if (!sampleName) {
          const sampleIdRaw = toStringSafe(
            getFirstValue(record, analysesDataset, [
              "cr2b6_sampleid",
              "sampleId",
            ])
          );

          if (sampleIdRaw) {
            // Look up sample name by ID in the sample dataset
            const sampleRecord = Object.values(sampleDataset.records).find(
              (sample) => {
                const id = toStringSafe(
                  getFirstValue(sample, sampleDataset, ["sampleId", "ID"])
                );
                return id && id === sampleIdRaw;
              }
            );

            if (sampleRecord) {
              const foundSampleName = toStringSafe(
                getFirstValue(sampleRecord, sampleDataset, [
                  "sampleName",
                  "ID", // CSV sample data has ID column with names
                  "cr2b6_id",
                  "Name",
                ])
              );
              sampleName = foundSampleName?.trim();
              matchedSampleId = sampleIdRaw;
            }
          }
        }

        // Method 3: Try GUID reference from production DataVerse data (cr2b6_sample)
        if (!sampleName) {
          // First try direct lookup value access
          const sampleLookup = record.getValue(
            "cr2b6_sample"
          ) as ComponentFramework.LookupValue;
          let sampleGuidRaw: string | undefined;

          if (sampleLookup && sampleLookup.id) {
            // Extract GUID from lookup
            sampleGuidRaw =
              typeof sampleLookup.id === "object" && sampleLookup.id !== null
                ? (sampleLookup.id as { guid: string }).guid
                : typeof sampleLookup.id === "string"
                ? sampleLookup.id
                : undefined;
          }

          // Fallback to string-based field access
          if (!sampleGuidRaw) {
            sampleGuidRaw = getFirstValue(record, analysesDataset, [
              "cr2b6_sample",
            ]) as string | undefined;
          }

          if (index < 3) {
            console.log(`Record[${index}] Lookup debug:`, {
              sampleLookup,
              sampleGuidRaw,
              lookupId: sampleLookup?.id,
              lookupName: sampleLookup?.name,
            });
          }

          let sampleGuid: string | undefined = sampleGuidRaw;
          if (sampleGuidRaw) {
            // Handle both direct GUID strings and formatted values like "Sample Name (GUID)"
            if (
              typeof sampleGuidRaw === "string" &&
              sampleGuidRaw.includes("(") &&
              sampleGuidRaw.includes(")")
            ) {
              const match = sampleGuidRaw.match(/\(([^)]+)\)$/);
              sampleGuid = match ? match[1] : sampleGuidRaw;
            }
          }

          // Try to find the sample name using the GUID
          if (sampleGuid && validSampleGuids.has(sampleGuid)) {
            const sampleRecord = sampleDataset.records[sampleGuid];
            if (sampleRecord) {
              const sampleNameFromRecord = getFirstValue(
                sampleRecord,
                sampleDataset,
                ["cr2b6_id", "ID", "Name"]
              ) as string | undefined;
              sampleName =
                typeof sampleNameFromRecord === "string"
                  ? sampleNameFromRecord.trim()
                  : undefined;
              matchedSampleId = sampleGuid;
            }
          }
        }

        const matched = hasSampleNameMap
          ? !!(sampleName && sampleNameToId.has(sampleName))
          : !!sampleName; // fallback: accept any record with a sample name

        // In production, if we have no sample linkage, let's be more permissive
        // and include all analysis records, then try to match in processing
        const fallbackMatched =
          !hasSampleNameMap || sampleNameToId.size === 0 ? true : matched;

        if (index < 3) {
          console.log(
            `Record[${index}] sampleName=${sampleName} matchedSampleId=${matchedSampleId} matched=${matched} fallbackMatched=${fallbackMatched}`
          );
        }
        return fallbackMatched;
      }
    );

    console.log("Filtered Analysis Records:", filteredAnalysisRecordIds);
    console.log(
      "Starting to process",
      filteredAnalysisRecordIds.length,
      "filtered analysis records"
    );

    // Create a map to store sample(name and id) and analysis values (method, value, expected, required)
    const sampleMethodMap: Record<
      string,
      {
        name: string;
        id: string;
        values: Record<string, CellValue>;
      }
    > = {};

    const methodNames = new Set<string>();

    // ----- UNIFIED Processing Block (Works for both CSV/Development and Production/DataVerse) -----
    // Iterate through the filtered analysis dataset records
    for (const recordId of filteredAnalysisRecordIds) {
      console.log(`\n=== Processing Analysis Record ${recordId} ===`);
      const record = analysesDataset.records[recordId];

      let sampleName = "Unknown Sample";
      let sampleId = "Unknown";

      // Method 1: Try Production DataVerse lookup reference (cr2b6_sample)
      const sampleRef = record.getValue(
        "cr2b6_sample"
      ) as ComponentFramework.LookupValue;

      if (sampleRef && sampleRef.id) {
        // Using lookup reference (Production DataVerse)
        sampleName = sampleRef?.name ?? "Unknown Sample";
        sampleId =
          typeof sampleRef?.id === "object" && sampleRef?.id !== null
            ? (sampleRef.id as { guid: string }).guid
            : typeof sampleRef?.id === "string"
            ? sampleRef.id
            : "Unknown";
        console.log(`Production lookup found: ${sampleName} (${sampleId})`);
      } else {
        // Method 2: Try CSV Development data - Direct sample name (Sample column is primary for CSV)
        const directSampleNameAny2 = getFirstValue(record, analysesDataset, [
          "Sample", // CSV dev data has Sample column with direct names
          "cr2b6_samplename",
          "sampleName",
          "Name",
        ]);
        const directSampleName2 = toStringSafe(directSampleNameAny2)?.trim();
        if (directSampleName2) {
          sampleName = directSampleName2;
          // For CSV data, try to map name to ID using sampleNameToId
          if (hasSampleNameMap && sampleNameToId.has(sampleName)) {
            sampleId = sampleNameToId.get(sampleName)!;
          } else {
            // Fallback: use sampleName as ID for CSV data
            sampleId = sampleName;
          }
        } else {
          // Method 3: Try production - extract sample name from analysis record fields
          // Look for any field that might contain a sample name pattern
          const analysisId = getFirstValue(record, analysesDataset, [
            "cr2b6_id",
            "ID",
          ]) as string | undefined;

          const notes = toStringSafe(
            getFirstValue(record, analysesDataset, ["cr2b6_notes", "Notes"])
          );

          // Try to match sample names from the available samples against analysis notes or ID
          if (hasSampleNameMap && sampleNameToId.size > 0) {
            for (const [
              availableSampleName,
              availableSampleId,
            ] of sampleNameToId.entries()) {
              // Check if the sample name appears in notes or analysis ID
              const analysisIdStr = toStringSafe(analysisId);
              if (
                (notes && notes.includes(availableSampleName)) ||
                (analysisIdStr && analysisIdStr.includes(availableSampleName))
              ) {
                sampleName = availableSampleName;
                sampleId = availableSampleId;
                console.log(
                  `Matched sample by pattern: ${sampleName} found in notes or ID`
                );
                break;
              }
            }
          }

          // Last resort: If we still don't have a sample name, use a generic one
          if (!sampleName) {
            sampleName = "Unknown Sample";
            sampleId = "Unknown";
          }
        }
      }

      // Extract method information (works for both CSV and DataVerse)
      const methodRef = record.getValue(
        "cr2b6_method"
      ) as ComponentFramework.LookupValue;
      const method =
        methodRef?.name ??
        (getFirstValue(record, analysesDataset, [
          "Method",
          "cr2b6_method",
          "cr2b6_methodname",
        ]) as string | undefined) ??
        "Unknown Method";

      console.log(`Sample: ${sampleName} (ID: ${sampleId})`);
      console.log(`Method: ${method}`);

      // Extract analysis values (works for both CSV and DataVerse)
      const valueRaw = getFirstValue(record, analysesDataset, [
        "Value",
        "cr2b6_value",
      ]) as string | number | null | undefined;
      const valueStr =
        valueRaw !== undefined && valueRaw !== null ? String(valueRaw) : "";
      const analysisId =
        (getFirstValue(record, analysesDataset, ["cr2b6_id", "ID"]) as
          | string
          | undefined) ?? "";
      const expectedValue =
        (getFirstValue(record, analysesDataset, [
          "Expected Value",
          "cr2b6_expectedvalue",
        ]) as string | undefined) ?? "";

      const unit =
        (getFirstValue(record, analysesDataset, [
          "Unit",
          "Unit (Method) (Analytical Method)",
          "a_bba5d516f7554068a842ff7ba08f80df.cr2b6_unit",
        ]) as string | undefined) ?? "";

      console.log(
        `Value: ${valueStr}, Expected: ${expectedValue}, Unit: ${unit}`
      );
      console.log(`Analysis ID: ${analysisId}`);

      //create a new sample entry if it doesn't already exist
      const key = sampleId !== "Unknown" ? sampleId : sampleName;
      if (!sampleMethodMap[key]) {
        sampleMethodMap[key] = {
          name: sampleName,
          id: sampleId,
          values: {},
        };
      }

      // Add the analysis data to the sample entry
      sampleMethodMap[key].values[method] = {
        analysisId,
        value: valueStr,
        unit: unit,
        expected: expectedValue,
        required: true,
      };

      //add the method name to a list to determine the column headers later
      methodNames.add(method);
    }

    console.log("SampleMethodMap:", sampleMethodMap);

    // Create the pivoted data structure
    const pivotData = Object.entries(sampleMethodMap).map(
      ([sampleId, { name, id, values }]) => {
        const row: Row = {
          sampleId,
          sampleName: name,
          sampleGuid: id,
        };

        for (const method of methodNames) {
          const entry = values[method];
          row[method] = entry ?? {
            analysisId: "",
            value: "",
            expected: "",
            required: false,
          };
        }

        return row;
      }
    );
    console.log("PivotData:", pivotData);
    console.log("Final props being passed to Grid:");
    console.log("- data.length:", pivotData.length);
    console.log("- methods.length:", Array.from(methodNames).length);
    console.log("- methods:", Array.from(methodNames));

    const props: IHelloWorldProps = {
      data: pivotData,
      methods: Array.from(methodNames),
    };

    // ✅ Wrap with FluentProvider for proper theming
    return React.createElement(
      FluentProvider,
      { theme: webLightTheme },
      React.createElement(Grid, props)
    );
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
   */
  public getOutputs(): IOutputs {
    return {};
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    // Add code to cleanup control if necessary
  }
}
