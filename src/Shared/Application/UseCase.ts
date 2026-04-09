export interface UseCase<IRequest, IResponse> {
    execute(request?: IRequest): IResponse | Promise<IResponse>;
}
