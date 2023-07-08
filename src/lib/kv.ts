import { type z } from "zod";
import { type valueOf } from "./constant";
import { kvEntries } from "./types/kv";

export class KV {
  private readonly entry: valueOf<typeof kvEntries>;

  constructor(
    public kv: KVNamespace,
    public key: keyof typeof kvEntries
  ) {
    this.entry = kvEntries[key];
  }

  public async get(): Promise<
    z.infer<(typeof this.entry)["value"]> | undefined
  > {
    const data = await this.kv.get(this.entry.key);
    if (data == null) return;
    return this.entry.value.parse(data);
  }

  public async set(
    value: z.infer<(typeof this.entry)["value"]>
  ): Promise<void> {
    await this.kv.put(this.entry.key, this.entry.value.parse(value), {
      expirationTtl: this.entry.ttl,
    });
  }

  public async delete(): Promise<void> {
    await this.kv.delete(this.entry.key);
  }
}
