export function Inject(token: string): ParameterDecorator {
  return (
    target: any,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) => {
    const existingParameters =
      Reflect.getMetadata("inject:tokens", target) || [];

    // Store the token for the specific parameter
    existingParameters[parameterIndex] = token;

    // Update metadata with the token
    Reflect.defineMetadata("inject:tokens", existingParameters, target);
  };
}
