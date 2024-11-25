import "reflect-metadata"; // Required for metadata APIs

export class Container {
  private registry = new Map<string, any>();

  bind<T>(token: string, implementation: new (...args: any[]) => T | T): void {
    this.registry.set(token, implementation);
  }
  resolve<T>(token: string): T {
    const implementation = this.registry.get(token);

    if (!implementation) {
      throw new Error(`No binding found for token: ${token}`);
    }

    // If the implementation is a class, resolve its dependencies
    if (typeof implementation === "function") {
      const dependencies: string[] =
        Reflect.getMetadata("inject:tokens", implementation) || [];

      const injections = dependencies.map((depToken: string) =>
        this.resolve(depToken)
      );

      return new implementation(...injections);
    }

    // If it's an instance, return it as-is
    return implementation;
  }
}
