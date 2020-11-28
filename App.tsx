import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Button, Header,Input,Text } from 'react-native-elements'


interface IRow{
  id:number,
  name:string
}

export default function App() {
  const [text,setText] = useState("");
  const [input_id,setInput_id] = useState("");
  const [input_name,setInput_name] = useState("");
  const [errorText,setErrorText] = useState("");
  const [sql,setSql] = useState("");
  createTable();
  select(setText);
  return (
    <View style={{
      height:"100%",
      }}>
      <Header 
      leftComponent={{icon:"menu"}}
      centerComponent={{text:"PocketSQL(適当)",style:{fontSize:20}}}
      rightComponent={{icon:"help"}}
      />
      <View style={{
          height:"40%",
          borderBottomWidth:1,
          padding:"1%"
        }}>
          <Text style={{fontSize:20,borderBottomWidth:1}}>{"実行結果"}</Text>
          <Text style={{fontSize:20}}>{text}</Text>
        </View>
        <View style={{
          height:"15%",
          borderBottomWidth:1,
          padding:"1%"
        }}>
          <Text style={{fontSize:20,borderBottomWidth:1}}>{"SQL文"}</Text>
          <Text style={{fontSize:20}}>{sql}</Text>
        </View>
        <View style={{
          height:"15%",
          borderBottomWidth:1,
          padding:"1%"
        }}>
          <Text style={{fontSize:20,borderBottomWidth:1}}>{"エラー"}</Text>
          <Text style={{fontSize:20}}>{errorText}</Text>
        </View>
        <View style={{
          flexDirection:"row",
          height:"10%",
          borderBottomWidth:1,
          padding:"1%",
        }}>
          <Input placeholder={"ID"} containerStyle={{width:"50%"}} value={input_id} onChangeText={(text)=>{
            setInput_id(text)
          }}/>
          <Input placeholder={"NAME"} containerStyle={{width:"50%"}} value={input_name} onChangeText={(text)=>{
            setInput_name(text);
          }}/>
        </View>
        <View style={{
          height:"10%",
          borderBottomWidth:1,
          padding:"1%",
          flexDirection:"row"
        }}>
          <Button title={"INSERT"} containerStyle={{width:"33.33%",padding:"1%"}} onPress={()=>{
            if(input_id != ""){
              insertToDb({id:parseInt(input_id),name:input_name},setErrorText,setSql);
              select(setText);
              setInput_id("");
              setInput_name("");
            }
          }}/>
          <Button title={"DELETE"} containerStyle={{width:"33.33%",padding:"1%"}} onPress={()=>{
            if(input_id != ""){
              deleteFromDb({id:parseInt(input_id),name:input_name},setSql);
              select(setText);
              setInput_id("");
              setInput_name("");
            }
          }}/>
          <Button title={"SHOW ALL"} containerStyle={{width:"33.33%",padding:"1%"}}/>
        </View>
    </View>
  );
}

function createTable(){
  const db = SQLite.openDatabase("testDB");
  db.transaction((tx) => {
    tx.executeSql(
      "create table if not exists players(id integer primary key not null,name text)",
      undefined,
      () => {console.log("create table success")},
      () => {console.log("create table fail"); return false;}
    );
  },
  () => {console.log("create table fail")},
  () => {console.log("create table success")}
  );
}

function insertToDb(row:IRow,setErrorTextHandle:(errorText:string)=>void,setSqlHandle:(errorText:string)=>void){
  const db = SQLite.openDatabase("testDB");
  const sql = 
  "insert into players values(" + 
  row.id.toString() + ",'" +
  row.name + "'" + 
  ")";
  setSqlHandle(sql);
  db.transaction((tx) => {
    tx.executeSql(
      sql
      ,
      undefined,
      () => {
        console.log("insert success");
        setErrorTextHandle("");
      },
      (tx,error) => {
        setErrorTextHandle(error.message);
        return false;
      }
    );
  },
  (error) => {
    setErrorTextHandle(error.message);
  },
  );
}

function deleteFromDb(row:IRow,setSqlHandle:(errorText:string)=>void){
  const db = SQLite.openDatabase("testDB");
  const sql = "delete from players where id = " + row.id.toString();
  setSqlHandle(sql);
  db.transaction((tx) => {
    tx.executeSql(
      sql,
      undefined,
      () => {console.log("delete success")},
      (tx,error) => {console.log(error);return false;}
    );
  },
  (error) => {console.log(error)},
  );
}

function select(setTextHandle:(t:string)=>void){
  const db = SQLite.openDatabase("testDB");
  let tText = "no data.";
  db.transaction((tx) => {
    tx.executeSql(
      "select * from players",
      undefined,
      (_,{rows: SQLResultSetRowList}) => {
        tText = "";
        for(let i=0;i<SQLResultSetRowList.length;i++){
          let trow:IRow = SQLResultSetRowList.item(i)
          tText += "id:" + trow.id.toString() + ", name:" + trow.name + "\n";
        }
      }
    );
  },
  () => {console.log("get fail")},
  () => {
    console.log("get success\n" + tText);
    setTextHandle(tText);
  }
  );
  return tText;
}