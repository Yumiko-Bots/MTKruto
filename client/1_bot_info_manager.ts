import { functions, types } from "../2_tl.ts";
import { BotCommand, botCommandScopeToTlObject } from "../3_types.ts";
import { GetMyCommandsParams, SetMyCommandsParams } from "./0_params.ts";
import { C } from "./0_types.ts";

export class BotInfoManager {
  #c: C;

  constructor(c: C) {
    this.#c = c;
  }

  async #setMyInfo(info: Omit<ConstructorParameters<typeof functions.bots.setBotInfo>[0], "bot">) {
    await this.#c.api.bots.setBotInfo({ bot: new types.InputUserSelf(), ...info });
  }

  async setMyDescription(params?: { description?: string; languageCode?: string }) {
    await this.#c.storage.assertBot("setMyDescription");
    await this.#setMyInfo({ description: params?.description, lang_code: params?.languageCode ?? "" });
  }

  async setMyName(params?: { name?: string; languageCode?: string }) {
    await this.#c.storage.assertBot("setMyName");
    await this.#setMyInfo({ name: params?.name, lang_code: params?.languageCode ?? "" });
  }

  async setMyShortDescription(params?: { shortDescription?: string; languageCode?: string }) {
    await this.#c.storage.assertBot("setMyShortDescription");
    await this.#setMyInfo({ about: params?.shortDescription, lang_code: params?.languageCode ?? "" });
  }

  #getMyInfo(languageCode?: string | undefined) {
    return this.#c.api.bots.getBotInfo({ bot: new types.InputUserSelf(), lang_code: languageCode ?? "" });
  }

  async getMyDescription(params?: { languageCode?: string }): Promise<string> {
    await this.#c.storage.assertBot("getMyDescription");
    return await this.#getMyInfo(params?.languageCode).then((v) => v.description);
  }

  async getMyName(params?: { languageCode?: string }): Promise<string> {
    await this.#c.storage.assertBot("getMyName");
    return await this.#getMyInfo(params?.languageCode).then((v) => v.description);
  }

  async getMyShortDescription(params?: { languageCode?: string }): Promise<string> {
    await this.#c.storage.assertBot("getMyShortDescription");
    return await this.#getMyInfo(params?.languageCode).then((v) => v.about);
  }

  async getMyCommands(params?: GetMyCommandsParams): Promise<BotCommand[]> {
    await this.#c.storage.assertBot("getMyCommands");
    const commands_ = await this.#c.api.bots.getBotCommands({
      lang_code: params?.languageCode ?? "",
      scope: await botCommandScopeToTlObject(params?.scope ?? { type: "default" }, this.#c.getInputPeer),
    });
    return commands_.map((v) => ({ command: v.command, description: v.description }));
  }

  async setMyCommands(commands: BotCommand[], params?: SetMyCommandsParams) {
    await this.#c.storage.assertBot("setMyCommands");
    await this.#c.api.bots.setBotCommands({
      commands: commands.map((v) => new types.BotCommand(v)),
      lang_code: params?.languageCode ?? "",
      scope: await botCommandScopeToTlObject(params?.scope ?? { type: "default" }, this.#c.getInputPeer),
    });
  }
}
