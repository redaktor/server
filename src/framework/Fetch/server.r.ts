
import API from "../core/decorator";
export const schemaMin = {"type":"object","properties":{"_constructor":{"$ref":"#/definitions/constructor1"},"fetch":{"$ref":"#/definitions/fetch"}},"additionalProperties":false,"definitions":{"constructor1":{"type":"object","properties":{"0":{"title":"options"}},"additionalProperties":false,"required":["0"]},"fetch":{"type":"object","properties":{"0":{"title":"options"}},"additionalProperties":false,"required":["0"]}},"$schema":"http://json-schema.org/draft-07/schema#"};
export const initializers = {
fetch: function(this: any, ...args: any[]) { return [void 0] },
};
export default API(schemaMin, initializers);
