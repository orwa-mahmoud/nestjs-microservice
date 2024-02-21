import { Injectable } from '@nestjs/common';
import { ResponseContainerException } from './response-container-exception';
import { ValidationError } from '@nestjs/common/interfaces/external/validation-error.interface';

export const rc = () => {
  return new ResponseContainer();
};

@Injectable()
export class ResponseContainer {
  private code = 200;
  private success = true;
  private messages: {
    key: string;
    text: string;
    type: string;
  }[] = [];
  private validation: { [key: string]: string[] } = {};
  private hidden: any[] = [];
  private data = false;

  addMessage(
    key: string,
    replace: { [key: string]: string } = {},
    type = 'MESSAGE',
    source = 'response',
  ): this {
    const _key = source + '.' + key;
    let translated: string = this.__(_key, replace);
    if (translated === _key) {
      translated = key;
    }
    this.messages.push({
      key: _key,
      text: translated,
      type: type,
    });

    return this;
  }

  getResponse() {
    return this.getVars();
  }

  setData(data: any = null): this {
    this.data = data;
    return this;
  }

  getCode(): number {
    return this.code;
  }

  getMessages(): {
    key: string | number;
    text: string | number;
    type: string;
  }[] {
    return this.messages;
  }

  private getVars(): any {
    if (this.code !== 422) {
      this.hidden.push('validation');
    }

    if (this.success && this.messages.length === 0) {
      this.addMessage('Operation done successfully');
    }

    const vars = { ...this };
    delete vars['hidden'];

    return Object.fromEntries(
      Object.entries(vars).filter(([key]) => !this.hidden.includes(key)),
    );
  }

  private __(key: string, replace: { [key: string]: number | string }): string {
    // TODO: add I18n
    return key;
  }

  error(code: number): ResponseContainerException {
    this.success = false;
    this.code = code;
    return new ResponseContainerException(this);
  }

  setCreated(
    messageKey = 'Created successfully',
    replace: { [key: string]: string } = {},
  ): this {
    this.addMessage(messageKey, replace);
    this.code = 201;
    return this;
  }

  errorNotFound(
    messageKey = 'Not Found',
    replace: { [key: string]: string } = {},
  ): ResponseContainerException {
    this.addMessage(messageKey, replace);
    return this.error(404);
  }

  errorConflict(
    messageKey = 'conflict data',
    replace: { [key: string]: string } = {},
  ): ResponseContainerException {
    this.addMessage(messageKey, replace);
    return this.error(409);
  }

  errorServiceUnavailable(
    messageKey = 'Service currently unavailable',
    replace: { [key: string]: string } = {},
  ): ResponseContainerException {
    this.addMessage(messageKey, replace);
    return this.error(503);
  }
  errorFail(
    messageKey = 'Operation failed',
    replace: { [key: string]: string } = {},
  ): ResponseContainerException {
    this.addMessage(messageKey, replace);
    return this.error(500);
  }

  errorBadRequest(
    messageKey = 'bad request',
    replace: { [key: string]: string } = {},
  ): ResponseContainerException {
    this.addMessage(messageKey, replace);
    return this.error(400);
  }

  errorGone(
    messageKey = 'expired',
    replace: { [key: string]: string } = {},
  ): ResponseContainerException {
    this.addMessage(messageKey, replace);
    return this.error(410);
  }

  errorTooManyAttempt(
    messageKey = 'Too Many Requests',
    replace: { [key: string]: string } = {},
  ): ResponseContainerException {
    this.addMessage(messageKey, replace);
    return this.error(429);
  }

  errorUnAuthenticated(
    messageKey = 'You need to login',
    replace: { [key: string]: string } = {},
  ): ResponseContainerException {
    this.addMessage(messageKey, replace);
    return this.error(401);
  }

  errorUnAuthorized(
    messageKey = 'Unauthorized to perform this action',
    replace: { [key: string]: string } = {},
  ): ResponseContainerException {
    this.addMessage(messageKey, replace);
    return this.error(403);
  }

  errorInValid(
    validation: ValidationError[],
    messageKey = 'Please make sure all required fields are filled out correctly',
    replace: { [key: string]: string } = {},
  ): ResponseContainerException {
    this.addMessage(messageKey, replace);
    validation.forEach((item) => {
      this.validation[item.property] = Object.values(item.constraints)?.map(
        (message) => message.replace(item.property + ' ', ''),
      );
    });
    return this.error(422);
  }

  errorNotAcceptable(
    messageKey = 'Not acceptable operation',
    replace: { [key: string]: string } = {},
  ): ResponseContainerException {
    this.addMessage(messageKey, replace);
    return this.error(406);
  }

  addAlert(messageKey: string, replace: { [key: string]: string } = {}): this {
    return this.addMessage(messageKey, replace, 'ALERT');
  }

  addInfo(messageKey: string, replace: { [key: string]: string } = {}): this {
    return this.addMessage(messageKey, replace, 'INFO');
  }
}
