import React, { useState, useEffect } from 'react';
import { View, Image } from 'react-native';

// Картинка с автоматической подменой на заглушку при ошибке загрузки
// source — объект вида { uri: 'https://...' } (может быть пустым {})
// fallback — локальная иконка категории (require(...)) или тоже { uri: ... }
// size — ширина и высота в px (по умолчанию 70)
export default function SmartImage({ source, fallback, size = 70 }) {
  const [hasError, setHasError] = useState(false);
  const defaultFallback = { uri: 'https://placehold.co/150x150/333/FFF?text=No+Image' };
  const finalFallback = fallback || defaultFallback;
  const uri = source && source.uri;

  useEffect(() => { setHasError(false); }, [uri]);

  const hasValidUri = uri && uri !== '';

  if (!hasValidUri) {
    return <Image source={finalFallback} style={{ width: size, height: size }} resizeMode="contain" />;
  }

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {!hasError ? (
        <Image
          source={source}
          style={{ width: size, height: size }}
          resizeMode="contain"
          onError={() => setHasError(true)}
        />
      ) : (
        <Image source={finalFallback} style={{ width: size, height: size }} resizeMode="contain" />
      )}
    </View>
  );
}