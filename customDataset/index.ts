import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { Grid, IHelloWorldProps } from "./Grid";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import * as React from "react";
import { CellValue, Row } from "./Grid";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
import Loading from "./Loading";
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export class customDataset
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
    if (!analysesDataset?.sortedRecordIds || !sampleDataset?.sortedRecordIds) {
      React.createElement(Loading);
    }

    // Log the datasets for debugging
    console.log("Version 0.0.9");
    console.log("Analysis records:", analysesDataset.records);
    console.log("Sample records:", sampleDataset.records);

    console.log("=== Sample Record IDs ===");
    sampleDataset.sortedRecordIds.forEach((recordId) => {
      console.log(recordId);
    });

    //get a list of sample IDs from the sample dataset
    const validSampleGuids = new Set(
      sampleDataset.sortedRecordIds.map((id) => {
        return (
          console.log(
            `ID: ${id}, recordID: ${sampleDataset.records[id].getRecordId()}
            `
          ),
          sampleDataset.records[id].getRecordId()
        );
      })
    );

    console.log("Valid Sample GUIDs:", validSampleGuids);
    console.log("analysis dataset:", analysesDataset);
    console.log("analysis dataset sorted record ids:", analysesDataset);

    // Filter analysis records to only include those with valid sample IDs
    console.log("=== Debugging Analysis Dataset ===");
    console.log("Total RecordIds:", analysesDataset?.sortedRecordIds?.length);
    console.log("Valid Sample GUIDs:", Array.from(validSampleGuids));

    const filteredAnalysisRecordIds = analysesDataset.sortedRecordIds.filter(
      (recordId, index) => {
        const record = analysesDataset.records[recordId];
        if (!record) {
          console.warn(
            `Record not found for recordId: ${recordId} (index: ${index})`
          );
          return false;
        }

        const sampleRef = record.getValue(
          "cr2b6_sample"
        ) as ComponentFramework.LookupValue;

        if (!sampleRef) {
          console.warn(`No 'cr2b6_sample' found for recordId: ${recordId}`);
          return false;
        }

        console.log(
          `Record[${index}] DataverseId: ${recordId}, sampleRef:`,
          sampleRef
        );

        // Handle weird type issues with the ID
        let sampleId: string = "Unknown";
        if (typeof sampleRef.id === "string") {
          sampleId = sampleRef.id;
        } else if (typeof sampleRef.id === "object" && sampleRef.id !== null) {
          const guidObj = sampleRef.id as { guid?: string };
          sampleId = guidObj.guid ?? "Unknown";
        }

        console.log(`Sample ID extracted: ${sampleId}`);

        const isValid =
          sampleId !== "Unknown" && validSampleGuids.has(sampleId);
        console.log(`Is sampleId in validSampleGuids?`, isValid);

        return isValid;
      }
    );

    console.log("Filtered Analysis Records:", filteredAnalysisRecordIds);

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

    // ----- Use this block for PRODUCTION -----
    // Iterate through the analysis dataset records
    for (const recordId of filteredAnalysisRecordIds) {
      const record = analysesDataset.records[recordId];
      const sampleRef = record.getValue(
        "cr2b6_sample"
      ) as ComponentFramework.LookupValue;
      const sampleName = sampleRef?.name ?? "Unknown Sample";
      const sampleId =
        typeof sampleRef?.id === "object" && sampleRef?.id !== null
          ? (sampleRef.id as { guid: string }).guid
          : "Unknown";
      const methodRef = record.getValue(
        "cr2b6_method"
      ) as ComponentFramework.LookupValue;
      const method = methodRef?.name ?? "Unknown Method";

      // ----- Use this block for TESTING -----
      // for (const recordId of analysesDataset.sortedRecordIds) {
      //   const record = analysesDataset.records[recordId];
      //   const method =
      //     (record.getValue("cr2b6_method") as string) || "Unknown Method";
      //   const sampleName =
      //     (record.getValue("cr2b6_samplename") as string) || "Unknown Method";
      //   const sampleId =
      //     (record.getValue("cr2b6_sampleid") as string) || "Unknown Method";

      const value = (record.getValue("cr2b6_value") as string) ?? null;
      const analysisId = (record.getValue("cr2b6_id") as string) ?? "";
      const expectedValue =
        (record.getValue("cr2b6_expectedvalue") as string) ?? "";

      const unit =
        (record.getValue(
          "a_bba5d516f7554068a842ff7ba08f80df.cr2b6_unit"
        ) as string) ?? "";
      console.log("Unit:", unit);

      //create a new sample entry if it doesn't already exist
      if (!sampleMethodMap[sampleId]) {
        sampleMethodMap[sampleId] = {
          name: sampleName,
          id: sampleId,
          values: {},
        };
      }

      // Add the analysis data to the sample entry
      sampleMethodMap[sampleId].values[method] = {
        analysisId,
        value: value,
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
