export const toPlainObject = <T>(protobufMessage: unknown): T =>
  JSON.parse(
    JSON.stringify(protobufMessage, (key, value) => {
      if (key.startsWith('$')) return;
      return value;
    })
  );
