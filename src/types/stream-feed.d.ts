declare module 'stream-feed' {
  export class StreamFeed {
    constructor(apiKey: string, apiSecret: string, appId: string);
    feed(type: string, id: string): any;
    addActivity(activity: any): Promise<any>;
    removeActivity(activityId: string): Promise<any>;
    getActivities(options?: any): Promise<any>;
  }
}
