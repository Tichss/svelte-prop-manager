export type Message<T = any> = {
    command: string;
    data: T;
};

export type Prop = {
    id: string;
    name: string;
    type: string;
    value?: string;
    bindable?: boolean;
    nullable?: boolean;
};



