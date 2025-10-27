
"use client";

//trpc + tanstak querry
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { trpc } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const AgentsView =( ) => {

    const {data} = trpc.agents.getMany.useQuery();

    return (
        <div>
 
            {JSON.stringify(data, null, 2)}
        </div>
    );
}

export const AgentsViewLoading = () => {
    return(
        <LoadingState 
        title=" Loading Agents" 
        description="This may take a fews seconds.."/>
    );
};

export const AgentsViewError = () => {
    return(
        <ErrorState
                title="Error Loading Agents..."
                description="Something went wrong"
                />
    );
};
