import { LinearModel, LinearModelDelta } from "./LinearModel";

export function trainLinearModel(model: LinearModel, inputVariable: number, outputVariable: number): LinearModelDelta {
    const ddSlope = -2 * (outputVariable - (model.intercept + model.slope * inputVariable));
    const ddIntercept = -2 * inputVariable * (outputVariable - (model.intercept + model.slope * inputVariable));

    const slopeDelta = ddSlope * model.learningRate;
    const interceptDelta = ddIntercept * model.learningRate;

    return {
        slope: model.slope - slopeDelta,
        intercept: model.intercept - interceptDelta,
    };
}