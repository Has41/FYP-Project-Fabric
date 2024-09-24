import { useQuery, useMutation } from "react-query"
import axiosInstance from "../utils/axiosInstance"
import { useMemo } from "react"

const useFetch = ({ endpoint, method = "GET", body = null, options = {} }) => {
  const { headers = {}, queryOptions = {}, mutationOptions = {}, retry = 3, retryDelay = 1000 } = options

  const fetchData = useMemo(() => {
    return async () => {
      const response = await axiosInstance.get(endpoint, {
        headers: {
          ...headers
        }
      })
      return response.data
    }
  }, [endpoint, headers])

  const mutateData = useMemo(() => {
    return async (mutateBody) => {
      const dataToSend = mutateBody || body
      const response = await axiosInstance({
        method,
        url: endpoint,
        data: dataToSend instanceof FormData ? dataToSend : JSON.stringify(dataToSend),
        headers: {
          ...headers,
          ...(dataToSend instanceof FormData ? {} : { "Content-Type": "application/json" })
        }
      })
      return response.data
    }
  }, [endpoint, method, body, headers])

  const useFetchQuery = useQuery([endpoint, method, JSON.stringify(body)], fetchData, {
    ...queryOptions,
    enabled: method === "GET",
    retry,
    retryDelay,
    onError: (error) => {
      console.error("Error fetching data:", error)
      if (queryOptions.onError) {
        queryOptions.onError(error)
      }
    }
  })

  const useFetchMutation = useMutation(mutateData, {
    ...mutationOptions,
    retry,
    retryDelay,
    onError: (error) => {
      console.error("Error mutating data:", error)
      if (mutationOptions.onError) {
        mutationOptions.onError(error)
      }
    }
  })

  const queryResult = method === "GET" ? useFetchQuery : useFetchMutation

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading || queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: useFetchQuery.refetch,
    mutate: useFetchMutation.mutate
  }
}

export default useFetch
