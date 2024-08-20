/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  FlatList,
  I18nManager,
  ToastAndroid,
  Modal,
  Alert,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faSquare,
  faCheckSquare,
  faPlus,
  faTrash,
  faXmark,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

// import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
type Task = {
  id: number;
  text: string;
  isDone: boolean;
  date: Date |null,
};

const translations = {
  en: {
    task_list: 'Task List',
    new_task_placeholder: 'Enter a new task',
    emptyTaskMessage: 'Please enter a task ! ',
    deleteMessage: 'Task deleted',
    addMessage: 'Task added',
  },
  tr: {
    task_list: 'Yapilacaklar',
    new_task_placeholder: 'Yeni görev girin',
    emptyTaskMessage: 'Lütfen yeni bir görev girin',
    deleteMessage: 'Görev silindi',
    addMessage: 'Görev eklendi',
  },
};

function App(): React.JSX.Element {
  // const [task, setTask] = useState<string>(''); // Yeni görev için metin
  const [tasks, setTasks] = useState<Task[]>([]); // Görevlerin listesi
  const [modalVisible, setModalVisible] = useState(false); // Modal açıp kapama kontrolü
  const [modalTask, setModalTask] = useState<string>(''); // Modal içindeki görev metni
  const [modalDate, setModalDate] = useState<Date | null>(null); // Modal içindeki tarih
  const [showDatePicker, setShowDatePicker] = useState(false); // Tarih seçici görünürlüğü
  //Detect device language
  const deviceLanguage = I18nManager.isRTL ? 'tr' : 'en';
  const strings = translations[deviceLanguage];

  useEffect(() => {
    const loadInitialTasks = async () => {
      const loadedTasks = await loadTasks();
      setTasks(loadedTasks);
    };
    loadInitialTasks();
  }, []);

  const saveTasks = async (ts: Task[]) => {
    try {
      const jsonTasks = JSON.stringify(ts);
      await AsyncStorage.setItem('tasks', jsonTasks);
    } catch (error) {
      console.error('Görevleri kaydederken bir hata oluştu:', error);
    }
  };
  const loadTasks = async () => {
    try {
      const jsonTasks = await AsyncStorage.getItem('tasks');
      return jsonTasks != null ? JSON.parse(jsonTasks) : [];
    } catch (error) {
      console.error('Görevleri yüklerken bir hata oluştu:', error);
      return [];
    }
  };
  const addTask = () => {
    console.log(modalTask.trim());
    if (modalTask.trim()) {
      const newTask: Task = {
        id: Date.now(),
        text: modalTask.trim(),
        isDone: false,
        date: modalDate,
      };
      setTasks([...tasks, newTask]); // Görev listesine ekleme
      saveTasks([...tasks, newTask]);
      setModalTask(''); // Giriş alanını temizleme
      setModalVisible(false);
      ToastAndroid.show(strings.addMessage, ToastAndroid.SHORT);
    }
  };

  const toggleTaskComplete = (id: number) => {
    const updatedTask = tasks.map(t =>
      t.id === id ? {...t, isDone: !t.isDone} : t,
    );
    setTasks(updatedTask);
    saveTasks(updatedTask);
  };

  const deleteTask = (id: number) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    ToastAndroid.show(strings.deleteMessage, ToastAndroid.SHORT);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{strings.task_list}</Text>
      <View
        style={{
          borderBottomColor: 'black',
          borderBottomWidth: StyleSheet.hairlineWidth,
        }}
      />
      <Text style={styles.emptyMessage}>
        {tasks.length === 0 ? strings.emptyTaskMessage : ''}
      </Text>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.taskItem}>
            <Pressable onPress={() => toggleTaskComplete(item.id)}>
              <FontAwesomeIcon
                icon={item.isDone ? faCheckSquare : faSquare}
                size={30}
                color={item.isDone ? '#45a606' : '#aeb0ac'}
              />
            </Pressable>
            <Pressable onPress={() => toggleTaskComplete(item.id)}>
              <Text
                style={[
                  styles.taskText,
                  {textDecorationLine: item.isDone ? 'line-through' : 'none'},
                ]}>
                {item.text}
              </Text>
            </Pressable>
            <Pressable onPress={() => deleteTask(item.id)}>
              <FontAwesomeIcon icon={faTrash} size={30} color="#900" />
            </Pressable>
          </View>
        )}
      />
      <View style={styles.addContainer}>
        {/*       <TextInput
          style={styles.input}
          placeholder={strings.new_task_placeholder}
          value={task}
          onChangeText={setTask}
        /> */}
        <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal closed');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            {/* <Text>Add Task:</Text> */}
            <TextInput
              style={styles.modalInput}
              placeholder={strings.new_task_placeholder}
              value={modalTask}
              onChangeText={setModalTask}
            />
            <Pressable
              style={styles.modalButton}
              onPress={addTask}
            >
              <Text style={styles.modalButtonText}><FontAwesomeIcon icon={faCheck}/></Text>
            </Pressable>
            <Pressable
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>
              <FontAwesomeIcon icon={faXmark} />
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {
      !modalVisible &&
        <Pressable
        onPress={() => {
          // addTask();
          setModalVisible(!modalVisible);
          console.log(modalVisible);
        }}
        style={styles.addButton}>
        <FontAwesomeIcon icon={faPlus} size={20} color="#fff" />
      </Pressable>
      }

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8ECC2',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: '#333',
    borderWidth: 1,
    padding: 10,
    borderRadius: 25,
    marginBottom: 10,
    color: 'black',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  taskText: {
    fontSize: 18,
    color: '#333',
    flexShrink: 1,
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  addButton: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: '#e28743',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: -10,
  },
  addButtonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 5,
  },
  addContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  emptyMessage: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalInput: {
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    padding: 6,
    width: 250,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#e28743',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    width: 150,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
