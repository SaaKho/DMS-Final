export function Injectable(): ClassDecorator {
  return (target: any) => {
    // Optionally, you can store metadata to mark the class as injectable
    Reflect.defineMetadata("injectable", true, target);
  };
}
