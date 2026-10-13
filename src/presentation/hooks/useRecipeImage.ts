import { useState, useEffect, useTransition } from 'react';
import { imageProviderClient, ImageQueryResult } from '../../infrastructure/api/image_provider_client';

export interface UseRecipeImageState {
  image: ImageQueryResult | null;
  isLoading: boolean;
  isError: boolean;
}

export function useRecipeImage(keyword: string): UseRecipeImageState {
  const [image, setImage] = useState<ImageQueryResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    imageProviderClient
      .fetchImageByKeyword({ keyword })
      .then(res => {
        if (isMounted) {
          startTransition(() => {
            setImage(res);
            setIsLoading(false);
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          startTransition(() => {
            setIsError(true);
            setIsLoading(false);
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [keyword]);

  return { image, isLoading, isError };
}
