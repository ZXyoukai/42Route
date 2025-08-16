import { Image, Text, View } from 'react-native';
import { EditScreenInfo } from './EditScreenInfo';

type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
};

export const ScreenContent = ({ title, path, children }: ScreenContentProps) => {
  return (
    <View className="items-center flex-1 justify-center">
      <Image
      source={require('../assets/route_logo-d.png')}
      className="h-28"
      resizeMode="contain"
      />
    </View>
  );
};
