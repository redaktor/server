
import API from "../../../../framework/core/decorator";
export const schemaMin = {"type":"object","properties":{"_constructor":{"$ref":"#/definitions/constructor1"},"run":{"$ref":"#/definitions/run"}},"additionalProperties":false,"definitions":{"constructor1":{"type":"object","additionalProperties":false},"run":{"type":"object","properties":{"0":{"title":"system"}},"additionalProperties":false,"required":["0"]}},"$schema":"http://json-schema.org/draft-07/schema#"};
export const initializers = {
run: function(this: any, ...args: any[]) { return [void 0] },
};
export default API(schemaMin, initializers);
