import React from "react";
import { TouchableOpacity, Text, View, StyleSheet, Image } from "react-native";


type Props ={
    flag:any;
    title:string;
    subtitle:string;
    selected?:boolean;
    onPress:()=>void;
};

export const LanguageCard: React.FC<Props>=({flag, title, subtitle, selected, onPress})=>{
    return (
        <TouchableOpacity style={[styles.card, selected && styles.selected]} onPress={onPress}>
            <Image source={flag} style={styles.flag}/>
            <View>
                <Text style={styles.title}>
                    {title}
                </Text>
                <Text style={styles.subtitle}>
                    {subtitle}
                </Text>
            </View>
            {selected && <Text style={styles.check}>✓</Text>}
        </TouchableOpacity>
    );
};

const styles=StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8BBD0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical:32,
    marginVertical: 8,
    gap: 35,
    alignSelf: 'stretch',
    height: 131,
    
    
  },
  selected: {
    borderWidth: 2,
    borderColor: '#ff0066',
  },
  flag: {
    width: 52,
    height: 52,
    marginRight: 12,
  },
  title: {
    fontWeight: 'medium',
    fontSize: 20,
    fontFamily:'inter',
    color:'#333333',
  },
  subtitle: {
    fontFamily:'poppins',
    fontWeight:'regular',
    fontSize: 16,
    color: '#645F5F',
  },
  check: {
    marginLeft: 'auto',
    color: '#ff0066',
    fontWeight: 'bold',
  },

});