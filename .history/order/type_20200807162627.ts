type Partial_<P = Object> = {
  [T in keyof P]?: P[T];
};

type Person = {
  age: number;
  name: string;
};

type UsePartial = Partial_<Person>;

type Pick_<P, K extends keyof P> = {
  [T in K]: P[K];
};

type UsePartial_ = Pick_<Person, "age">;

type Record_<T extends keyof any, P> = {
  [K in T]: P;
};

type AOb = Record_<keyof Person, Person>;

type Exclude_<T, U> = U extends T ? never : U;

type U1 = Exclude<keyof Person, "age">;

type ReturnType_<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R
  ? R
  : any;

type Test = ReturnType_<() => string[]>;
