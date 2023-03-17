import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TouchableHighlight, TextInput, Alert } from 'react-native';
import { theme } from './colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto } from '@expo/vector-icons';

const STORAGE_KEY = '@storage_Key'
const STATUE_KEY = '@statue_Key'

export default function App() {
  const saveStatue = async (statue) => {	/**상태저장*/
    try {
      await AsyncStorage.setItem(STATUE_KEY, JSON.stringify(statue))
      const s = JSON.parse(await AsyncStorage.getItem(STATUE_KEY))
    } catch (e) {
      console.log(e)
    }
  }
  const loadStatue = async () => {	/**상태로드*/
    try {
      const s = JSON.parse(await AsyncStorage.getItem(STATUE_KEY))
      console.log("STATUE: Working is " + s)
      setWorking(s)
    } catch (e) {
      console.log(e)
    }
  }

  const [working, setWorking] = useState(true);
  const [text, setText] = useState("")
  const [editText, setEditText] = useState({})
  const [toDos, setToDos] = useState({})
  const travel = () => { setWorking(false); saveStatue(false); }
  const work = () => { setWorking(true); saveStatue(true); }




  const saveToDos = async (toSave) => {	/**할일저장*/
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (e) {
      console.log(e)
    }
  }
  const loadToDos = async () => {	/**할일로드*/
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if (s !== null) { // 값이 null이 아닐 경우에만 JSON.parse() 메소드 호출
        setToDos(JSON.parse(s));
      }
    } catch (e) {
      console.log(e)
    }
  }
  useEffect(() => { /** 최초렌더링에서 할일로드 */
    loadStatue();
    loadToDos();
  }, [])

  const onChangeText = (payload) => setText(payload);
  const onChangeEditText = (payload, key) => {
    setEditText({
      ...editText,
      [key]: payload
    });
  };

  const newTodos = {
    ...toDos,
    [Date.now()]: { text, work: working, complete: false, isEditing: false }
  };
  const addToDo = async () => { /**할일 추가 */
    if (text === "") {
      return
    }
    setToDos(newTodos)
    await saveToDos(newTodos)
    setText("")
  };

  const deleteToDo = (key) => { /**할일 삭제 */
    Alert.alert("Delete To Do?", "Are you sure?",
      [{ text: "Cancel" },
      {
        text: "I'm sure",
        onPress: async () => {
          const newToDos = { ...toDos }
          delete newToDos[key]
          setToDos(newToDos);
          saveToDos(newToDos);
        }
      }])
    return
  };

  const editToDo = (key, complete, text) => { /**할일 수정 */
    if (text == "") {
      text = toDos[key].text
    }
    const newToDos = { ...toDos }
    newToDos[key] = { text: text, work: newToDos[key].work, complete: complete, isEditing: newToDos[key].isEditing }
    newToDos[key].isEditing = false
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  const editToDoOpenInput = (key, text) => {
    const newToDos = { ...toDos }
    newToDos[key].isEditing = true
    onChangeEditText(text, key)
    setToDos(newToDos);
    saveToDos(newToDos);
  }

  console.log("\n\n");
  console.log("toDos:");
  console.log(toDos);
  console.log("editText:");
  console.log(editText);


  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { work(); }}>
          <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { travel(); }}>
          <Text style={{ ...styles.btnText, color: !working ? "white" : theme.grey }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        returnKeyType="done"
        returnKeyLabel="시발"
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        value={text}
        placeholder={working ? "뭐할건데" : "어디갈건데"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) => {
          return toDos[key].work === working ? (
            <View style={styles.toDo} key={key}>
              {toDos[key].complete === false ? (/**완료여부 */
                <TouchableOpacity onPress={() => editToDo(key, true, toDos[key].text)}>
                  <Fontisto name="checkbox-passive" size={18} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => editToDo(key, false, toDos[key].text)}>
                  <Fontisto name="checkbox-active" size={18} color={theme.grey} />
                </TouchableOpacity>
              )}

              {toDos[key].isEditing === false ? (/**수정창 여부 */
                <TouchableOpacity onPress={() => { editToDoOpenInput(key, toDos[key].text) }}>
                  <Text style={styles.toDoText}>{toDos[key].text}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => editToDo(key, false, toDos[key].text)}>
                  <TextInput
                    returnKeyType="done"
                    returnKeyLabel="시발"
                    onSubmitEditing={() => editToDo(key, toDos[key].complete, editText[key])}
                    onChangeText={(payload) => onChangeEditText(payload, key)}
                    value={editText[key]}
                    placeholder={working ? "뭐할건데" : "어디갈건데"}
                    style={styles.editInput}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Fontisto name="trash" size={18} color={theme.grey} />
              </TouchableOpacity>
            </View>
          ) : null
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 0,
  },
  btnText: {
    fontSize: 35,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 10,
    fontSize: 18,
  },
  editInput: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: -10,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500"
  },
});
