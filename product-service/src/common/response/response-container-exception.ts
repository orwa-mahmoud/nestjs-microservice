import { HttpException } from '@nestjs/common';
import { ResponseContainer } from './response-container';

export class ResponseContainerException extends HttpException {
  public responseContainer: ResponseContainer;
  public message: string;

  constructor(responseContainer: ResponseContainer) {
    super(responseContainer.getResponse(), responseContainer.getCode());
    this.responseContainer = responseContainer;
    this.message = `[${responseContainer.getCode()}] ${responseContainer
      .getMessages()
      .map((item) => item.text)
      .join(', ')}`;
  }
}
