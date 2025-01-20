import { Handlers } from "../triggers";

export class A implements Handlers {
  init(): void {
    console.log("create A init");
  }
}
